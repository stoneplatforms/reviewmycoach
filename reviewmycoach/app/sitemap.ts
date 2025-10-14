import type { MetadataRoute } from 'next';
import { db } from './lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://reviewmycoach.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/coaches`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/classes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Dynamic coach profile URLs
  const coachDocs = await db.collection('coaches').select('username', 'updatedAt').limit(5000).get();
  const coachRoutes: MetadataRoute.Sitemap = [];
  coachDocs.forEach((doc) => {
    const data = doc.data() as { username?: string; updatedAt?: { toDate: () => Date } };
    const username = data.username || doc.id;
    if (!username) return;
    coachRoutes.push({
      url: `${baseUrl}/coach/${encodeURIComponent(String(username))}`,
      lastModified: data.updatedAt ? data.updatedAt.toDate() : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return [...staticRoutes, ...coachRoutes];
}


