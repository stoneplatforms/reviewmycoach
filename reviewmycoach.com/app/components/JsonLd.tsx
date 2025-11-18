export default function JsonLd() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ReviewMyCoach',
    url: 'https://reviewmycoach.com',
    logo: 'https://reviewmycoach.com/logos/reviewmycoachlogo.png',
    sameAs: [
      'https://twitter.com/reviewmycoach'
    ]
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ReviewMyCoach',
    url: 'https://reviewmycoach.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://reviewmycoach.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}


