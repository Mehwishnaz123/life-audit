'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return { supabase, user };
}

const refresh = () => revalidatePath('/app', 'layout');

export async function addTask(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  const { supabase, user } = await userClient();
  const area = String(formData.get('area_id') || '');
  const due = String(formData.get('due_date') || '');
  const priority = String(formData.get('priority') || 'medium');
  await supabase.from('tasks').insert({
    user_id: user.id,
    title: title.slice(0, 200),
    area_id: area || null,
    due_date: due || null,
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
  });
  refresh();
}

export async function toggleTask(formData: FormData) {
  const { supabase, user } = await userClient();
  const done = formData.get('done') === '1';
  await supabase
    .from('tasks')
    .update({ status: done ? 'todo' : 'done', completed_at: done ? null : new Date().toISOString() })
    .eq('id', String(formData.get('id')))
    .eq('user_id', user.id);
  refresh();
}

export async function deleteTask(formData: FormData) {
  const { supabase, user } = await userClient();
  await supabase.from('tasks').delete().eq('id', String(formData.get('id'))).eq('user_id', user.id);
  refresh();
}
