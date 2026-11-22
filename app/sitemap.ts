import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { path: '', priority: 1 },
    { path: '/features', priority: 0.9 },
    { path: '/pricing', priority: 0.8 },
    { path: '/faq', priority: 0.7 },
    { path: '/about', priority: 0.6 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
  ].map((p) => ({ url: SITE_URL + p.path, lastModified: now, changeFrequency: 'weekly', priority: p.priority }));
}
