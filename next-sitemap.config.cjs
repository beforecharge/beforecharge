/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://beforecharge.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/subscriptions',
    '/subscriptions/*',
    '/analytics',
    '/analytics/*',
    '/calendar',
    '/calendar/*',
    '/settings',
    '/settings/*',
    '/auth/*',
    '/api/*',
    '/admin/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/subscriptions',
          '/analytics',
          '/calendar',
          '/settings',
          '/auth/',
          '/api/',
          '/admin/',
          '/_next/server/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    let priority = 0.7;
    let changefreq = 'monthly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'weekly';
    } else if (path === '/pricing') {
      priority = 0.9;
      changefreq = 'monthly';
    } else if (path === '/features') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path === '/about') {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path === '/blog') {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (['/privacy', '/terms'].includes(path)) {
      priority = 0.4;
      changefreq = 'yearly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
