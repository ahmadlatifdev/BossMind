import Head from 'next/head';

export default function SEO({
  title = 'Resumora — AI-Powered Luxury Resume Builder',
  description = 'Craft professional resumes that command attention. Resumora by BossMind combines AI intelligence with luxury design to build resumes that open doors.',
  canonical,
  ogImage = '/og-image.png',
  noindex = false,
}) {
  const siteName = 'Resumora';
  const siteUrl = 'https://resumora.net';
  const fullTitle = title.includes('Resumora') ? title : `${title} | ${siteName}`;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: siteName,
            url: siteUrl,
            description,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'USD',
              lowPrice: '0',
              highPrice: '29',
            },
            creator: {
              '@type': 'Organization',
              name: 'BossMind',
              url: siteUrl,
            },
          }),
        }}
      />
    </Head>
  );
}
