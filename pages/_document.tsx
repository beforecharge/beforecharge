import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="BeforeCharge — Know Before You Owe" />
        <meta
          name="description"
          content="Take control of your subscription spending. Track, manage, and optimize all your subscription services in one secure dashboard."
        />
        <meta
          name="keywords"
          content="beforecharge, subscription manager, subscription tracker, recurring payments, budget tracker, subscription analytics, cancel subscriptions, subscription reminder, subscription management app"
        />
        <meta name="author" content="BeforeCharge" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://beforecharge.com/" />
        <meta property="og:site_name" content="BeforeCharge" />
        <meta property="og:title" content="BeforeCharge — Know Before You Owe" />
        <meta
          property="og:description"
          content="Take control of your subscription spending. Track, manage, and optimize all your subscription services in one secure dashboard."
        />
        <meta property="og:image" content="https://beforecharge.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="BeforeCharge - Subscription Management Dashboard" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://beforecharge.com/" />
        <meta name="twitter:title" content="BeforeCharge — Know Before You Owe" />
        <meta
          name="twitter:description"
          content="Take control of your subscription spending. Track, manage, and optimize all your subscription services in one secure dashboard."
        />
        <meta name="twitter:image" content="https://beforecharge.com/og-image.png" />
        <meta name="twitter:image:alt" content="BeforeCharge - Subscription Management Dashboard" />
        <meta name="twitter:creator" content="@beforecharge" />
        <meta name="twitter:site" content="@beforecharge" />

        {/* Theme and appearance */}
        <meta name="theme-color" content="#00e5a0" />
        <meta name="color-scheme" content="light dark" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="BeforeCharge" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BeforeCharge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#00e5a0" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://beforecharge.com/" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'BeforeCharge',
              url: 'https://beforecharge.com',
              logo: 'https://beforecharge.com/logo.png',
              description: 'Subscription management and tracking platform',
              sameAs: [
                'https://twitter.com/beforecharge',
                'https://facebook.com/beforecharge',
                'https://linkedin.com/company/beforecharge'
              ]
            })
          }}
        />

        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'BeforeCharge',
              url: 'https://beforecharge.com',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              description: 'Track, manage, and optimize all your subscription services in one secure dashboard.',
              featureList: [
                'Subscription tracking',
                'Renewal reminders',
                'Spending analytics',
                'Multi-currency support',
                'Gmail auto-fetch',
                'Cancellation guides'
              ]
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
