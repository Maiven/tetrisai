import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://decision-mirror-eight.vercel.app';
  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'ko-KR': `${base}/`,
          en: `${base}/en`,
        },
      },
    },
    {
      url: `${base}/en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'ko-KR': `${base}/`,
          en: `${base}/en`,
        },
      },
    },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/en/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/en/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/en/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
