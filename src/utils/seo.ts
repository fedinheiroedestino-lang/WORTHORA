import { Post, CategorySlug } from '../types';

export function updateDocumentMeta(options: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worthora.blog';
  const defaultTitle = 'Worthora';
  const defaultDesc = 'Tested and compared: the best tools, electronics, clothing, home decor, personal care, and books for smart buying decisions.';
  const defaultImage = `${origin}/worthora_logo.jpg`;

  const finalTitle = options.title ? `${options.title} | Worthora` : defaultTitle;
  const finalDesc = options.description || defaultDesc;
  const finalImage = options.image || defaultImage;
  const finalUrl = options.url || origin;

  // Title
  document.title = finalTitle;

  // Helpers to set or create meta tag
  const setMeta = (nameOrProperty: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${nameOrProperty}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameOrProperty, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard SEO
  setMeta('name', 'description', finalDesc);
  setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  if (options.tags && options.tags.length > 0) {
    setMeta('name', 'keywords', options.tags.join(', '));
  }

  // OpenGraph
  setMeta('property', 'og:title', finalTitle);
  setMeta('property', 'og:description', finalDesc);
  setMeta('property', 'og:image', finalImage);
  setMeta('property', 'og:url', finalUrl);
  setMeta('property', 'og:type', options.type || 'website');
  setMeta('property', 'og:site_name', 'Worthora');
  setMeta('property', 'og:locale', 'en_US');

  if (options.type === 'article') {
    if (options.publishedTime) {
      setMeta('property', 'article:published_time', options.publishedTime);
    }
    if (options.modifiedTime) {
      setMeta('property', 'article:modified_time', options.modifiedTime);
    }
    if (options.section) {
      setMeta('property', 'article:section', options.section);
    }
    if (options.tags) {
      options.tags.forEach(t => {
        setMeta('property', 'article:tag', t);
      });
    }
  }

  // Twitter Cards
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', finalTitle);
  setMeta('name', 'twitter:description', finalDesc);
  setMeta('name', 'twitter:image', finalImage);

  // Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', finalUrl);
}

export function updateMetaForPost(post: Post) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worthora.blog';
  const postUrl = `${origin}/?p=${encodeURIComponent(post.slug)}`;

  updateDocumentMeta({
    title: `${post.title} – Benchmark Review & Lab Verdict`,
    description: post.excerpt || `Full head-to-head comparison and laboratory bench test breakdown for ${post.title}. Score: ${post.quickVerdict.overallScore}/10.`,
    image: post.featuredImage,
    url: postUrl,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt || post.publishedAt,
    section: post.categoryLabel,
    tags: post.tags
  });
}

export function updateMetaForCategory(category: CategorySlug) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worthora.blog';
  const catNames: Record<CategorySlug, string> = {
    'all': 'All Reviews & Comparisons',
    'electronics': 'Electronics & Gadgets',
    'tools': 'Tools & Hardware Bench Tests',
    'clothing': 'Clothing & Technical Apparel',
    'home-decoration': 'Home and Decoration & Appliances',
    'personal-care': 'Personal Care & Grooming Gear',
    'books': 'Books & Reading Technology',
    // Legacy support:
    'power-tools': 'Tools & Hardware',
    'smart-home': 'Electronics & Smart Devices',
    'kitchen-appliances': 'Home and Decoration',
    'home-utilities': 'Tools & Home Utilities',
    'outdoor-gear': 'Tools & Outdoor Equipment'
  };

  const name = catNames[category] || 'Equipment Reviews';
  updateDocumentMeta({
    title: `${name} – Tested & Reviewed`,
    description: `Browse verified bench test shootouts and buyer guides in ${name}. Ranked by torque, acoustic noise, thermal load, and value.`,
    url: `${origin}/?category=${category}`,
    type: 'website'
  });
}
