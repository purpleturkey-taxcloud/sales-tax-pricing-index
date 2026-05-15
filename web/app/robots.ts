import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Internal route shapes — public URLs are /{slug}-pricing and
        // /{a}-vs-{b}-pricing, served via Next rewrites. The /p/* and /c/*
        // paths 308 to the pretty URLs but we don't want crawlers spending
        // time on them.
        disallow: ['/p/', '/c/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
