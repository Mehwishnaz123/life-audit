import { createPublicClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/site';

export type Faq = { id: string; question: string; answer: string; sort_order: number; published: boolean };
export type Plan = {
  id: string;
  name: string;
  price_label: string;
  period: string;
  tagline: string;
  features: string[];
  highlighted: boolean;
  sort_order: number;
};
export type Settings = Record<string, string>;

export const DEFAULT_SETTINGS: Settings = {
  hero_badge: 'Your personal command center',
  hero_title: 'Your entire life, finally in one place.',
  hero_subtitle: 'Plan your days. Build your future. Track your growth. Understand your life.',
  cta_label: 'Start Managing Your Life',
  founder_name: '[Founder name]',
  founder_bio: '[A few lines about who is building this product and why.]',
  contact_email: '[YOUR EMAIL]',
};

export const DEFAULT_FAQS: Faq[] = [
  ['What is Life Audit?', 'Life Audit is an all-in-one personal life management platform. It combines a planner, goals, tasks, habits, a journal and progress analytics, so you can plan your life and see how you actually spend it.'],
  ['How is it different from a to-do list or a habit tracker?', 'Those tools each hold one piece. Life Audit links yearly goals to monthly targets and an hourly schedule, then compares what you planned with what you actually did.'],
  ['Is my journal private?', 'Yes. Journal and gratitude entries belong to your account only. Other users can never see them, and they are never shown to search engines.'],
  ['Can I create my own life areas?', 'Yes. The default areas (faith, career, education, health, family, growth and finance) are a starting point. You can rename, archive or add your own.'],
  ['What happens to my data if I downgrade?', 'Everything you have already recorded stays readable and exportable. A downgrade only limits creating new items beyond the free plan.'],
  ['Does the AI assistant make things up about me?', 'No. The assistant is planned for a later release and is designed to use only the activity you recorded. With too little data it says so.'],
].map(([question, answer], i) => ({ id: 'default-' + i, question, answer, sort_order: i, published: true }));

export const DEFAULT_PLANS: Plan[] = [
  { id: 'free', name: 'Free', price_label: '$0', period: 'forever', tagline: 'Everything you need to start.', features: ['Basic daily planner', 'Limited goals', 'Basic habits', 'Basic journaling', 'Simple progress tracking'], highlighted: false, sort_order: 0 },
  { id: 'premium', name: 'Premium', price_label: '$4.99', period: 'per month', tagline: 'The complete life system.', features: ['Unlimited planning and life areas', 'Advanced Life Audit', 'Advanced analytics', 'Full habit history', 'Advanced reminders', 'Custom dashboard', 'Extended journaling'], highlighted: true, sort_order: 1 },
  { id: 'pro', name: 'Pro', price_label: '$9.99', period: 'per month', tagline: 'Premium plus your AI assistant.', features: ['Everything in Premium', 'AI life assistant', 'Personalized insights', 'AI monthly and yearly reports', 'Fitness and self-development programs', 'Advanced templates and challenges'], highlighted: false, sort_order: 2 },
];

/** Reads public website content from the database, falling back to defaults. */
export async function getSiteContent(): Promise<{ settings: Settings; faqs: Faq[]; plans: Plan[]; fromDatabase: boolean }> {
  if (!isSupabaseConfigured()) {
    return { settings: DEFAULT_SETTINGS, faqs: DEFAULT_FAQS, plans: DEFAULT_PLANS, fromDatabase: false };
  }
  try {
    const db = createPublicClient();
    const [s, f, p] = await Promise.all([
      db.from('site_settings').select('key, value'),
      db.from('site_faqs').select('*').eq('published', true).order('sort_order'),
      db.from('site_plans').select('*').order('sort_order'),
    ]);
    if (s.error || f.error || p.error) throw s.error || f.error || p.error;
    const settings = { ...DEFAULT_SETTINGS };
    (s.data || []).forEach((r: any) => {
      if (r.value) settings[r.key] = r.value;
    });
    return {
      settings,
      faqs: f.data && f.data.length ? (f.data as Faq[]) : DEFAULT_FAQS,
      plans: p.data && p.data.length ? (p.data as Plan[]) : DEFAULT_PLANS,
      fromDatabase: true,
    };
  } catch {
    return { settings: DEFAULT_SETTINGS, faqs: DEFAULT_FAQS, plans: DEFAULT_PLANS, fromDatabase: false };
  }
}
