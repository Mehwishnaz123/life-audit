'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandMark from './BrandMark';
import { logout } from '@/lib/actions/auth';

const I = {
  chat: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  wand: 'M4 20L14 10M15 4v3M18.5 5.5l-2 2M20 9h-3M12 6l1 1',
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  week: 'M4 5h16v15H4zM4 10h16M9 10v10M14 10v10M8 3v4M16 3v4',
  month: 'M4 5h16v15H4zM4 10h16M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2',
  year: 'M3 4h7v7H3zM14 4h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  goal: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  task: 'M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M12 6h8M12 12h8M12 18h8',
  alarm: 'M12 6a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 10v3l2 1M4 4l3 2M20 4l-3 2',
  habit: 'M20 4v5h-5M4 20v-5h5M19 9a8 8 0 0 0-14-2M5 15a8 8 0 0 0 14 2',
  journal: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM9 9h6M9 13h4',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  report: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  chart: 'M4 20V10M10 20V4M16 20v-7M2 20h20',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  areas: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1',
  admin: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
};

const GROUPS: { title: string; items: { href: string; label: string; icon: string }[] }[] = [
  { title: '', items: [{ href: '/app', label: 'Home', icon: I.home }] },
  {
    title: 'Plan',
    items: [
      { href: '/app/day', label: 'Today (hour by hour)', icon: I.clock },
      { href: '/app/week', label: 'This week', icon: I.week },
      { href: '/app/calendar', label: 'This month', icon: I.month },
      { href: '/app/year', label: 'This year', icon: I.year },
    ],
  },
  {
    title: 'Do',
    items: [
      { href: '/app/tasks', label: 'Tasks', icon: I.task },
      { href: '/app/deadlines', label: 'Deadlines', icon: I.alarm },
      { href: '/app/habits', label: 'Habits', icon: I.habit },
      { href: '/app/goals', label: 'Goals', icon: I.goal },
    ],
  },
  {
    title: 'Reflect',
    items: [
      { href: '/app/journal', label: 'Journal', icon: I.journal },
      { href: '/app/gratitude', label: 'Gratitude', icon: I.heart },
    ],
  },
  {
    title: 'Reports',
    items: [
      { href: '/app/audit', label: 'My reports', icon: I.report },
      { href: '/app/analytics', label: 'Life balance', icon: I.chart },
      { href: '/app/assistant', label: 'Smart tips', icon: I.spark },
    ],
  },
  {
    title: 'AI helpers',
    items: [
      { href: '/app/coach', label: 'AI Coach', icon: I.chat },
      { href: '/app/planner', label: 'AI Planner', icon: I.wand },
    ],
  },
  {
    title: 'Settings',
    items: [
      { href: '/app/areas', label: 'Life areas', icon: I.areas },
      { href: '/app/settings', label: 'Settings', icon: I.gear },
    ],
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      <path d={d} />
    </svg>
  );
}

export default function AppSidebar({ siteName, isAdmin }: { siteName: string; isAdmin: boolean }) {
  const path = usePathname();
  const active = (href: string) => (href === '/app' ? path === '/app' : path === href || path.startsWith(href + '/'));
  return (
    <aside className="side">
      <Link href="/" className="brand">
        <BrandMark />
        <span>{siteName}</span>
      </Link>
      <nav aria-label="App" className="side-nav">
        {GROUPS.map((g) => (
          <div key={g.title || 'home'} className="side-group">
            {g.title && <span className="side-title">{g.title}</span>}
            {g.items.map((l) => (
              <Link key={l.href} href={l.href} aria-current={active(l.href) ? 'page' : undefined}>
                <Icon d={l.icon} />
                <span>{l.label}</span>
              </Link>
            ))}
          </div>
        ))}
        {isAdmin && (
          <div className="side-group">
            <span className="side-title">Owner</span>
            <Link href="/admin" aria-current={path.startsWith('/admin') ? 'page' : undefined}>
              <Icon d={I.admin} />
              <span>Website admin</span>
            </Link>
          </div>
        )}
      </nav>
      <form action={logout} className="side-foot side-nav">
        <button type="submit">Log out</button>
      </form>
    </aside>
  );
}
