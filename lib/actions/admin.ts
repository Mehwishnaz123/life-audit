'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const SETTING_KEYS = ['hero_badge', 'hero_title', 'hero_subtitle', 'cta_label', 'founder_name', 'founder_bio', 'contact_email'] as const;

// Every admin action checks the role on the server. The database rules check it again.
async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/admin');
  return { supabase, user };
}

function done(section: string, error?: { message: string } | null) {
  revalidatePath('/', 'layout');
  redirect(error ? `/admin?error=${encodeURIComponent(error.message)}#${section}` : `/admin?saved=${section}#${section}`);
}

async function log(supabase: any, userId: string, action: string, detail: string) {
  await supabase.from('admin_audit_log').insert({ user_id: userId, action, detail: detail.slice(0, 500) });
}

export async function saveSettings(formData: FormData) {
  const { supabase, user } = await adminClient();
  const rows = SETTING_KEYS.map((key) => ({ key, value: String(formData.get(key) || '').trim(), updated_at: new Date().toISOString() }));
  const { error } = await supabase.from('site_settings').upsert(rows);
  if (!error) await log(supabase, user.id, 'settings.save', 'Website text updated');
  done('text', error);
}

export async function saveFaq(formData: FormData) {
  const { supabase, user } = await adminClient();
  const id = String(formData.get('id') || '');
  const row = {
    question: String(formData.get('question') || '').trim(),
    answer: String(formData.get('answer') || '').trim(),
    sort_order: Number(formData.get('sort_order') || 0),
    published: formData.get('published') === 'on',
  };
  if (!row.question || !row.answer) done('faqs', { message: 'A question and an answer are both needed.' });
  const { error } = id ? await supabase.from('site_faqs').update(row).eq('id', id) : await supabase.from('site_faqs').insert(row);
  if (!error) await log(supabase, user.id, id ? 'faq.update' : 'faq.create', row.question);
  done('faqs', error);
}

export async function deleteFaq(formData: FormData) {
  const { supabase, user } = await adminClient();
  const id = String(formData.get('id') || '');
  const { error } = await supabase.from('site_faqs').delete().eq('id', id);
  if (!error) await log(supabase, user.id, 'faq.delete', id);
  done('faqs', error);
}

export async function savePlan(formData: FormData) {
  const { supabase, user } = await adminClient();
  const id = String(formData.get('id') || '');
  const row = {
    name: String(formData.get('name') || '').trim(),
    price_label: String(formData.get('price_label') || '').trim(),
    period: String(formData.get('period') || '').trim(),
    tagline: String(formData.get('tagline') || '').trim(),
    features: String(formData.get('features') || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    highlighted: formData.get('highlighted') === 'on',
  };
  const { error } = await supabase.from('site_plans').update(row).eq('id', id);
  if (!error) await log(supabase, user.id, 'plan.update', id);
  done('plans', error);
}
