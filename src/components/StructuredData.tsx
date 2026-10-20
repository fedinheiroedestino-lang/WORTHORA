import React from 'react';
import { Post } from '../types';

interface StructuredDataProps {
  post?: Post;
  type: 'home' | 'post' | 'category';
  categoryName?: string;
}

const SITE_URL = 'https://worthora.blog';

export const StructuredData: React.FC<StructuredDataProps> = ({ post, type, categoryName }) => {
  if (type === 'home') {
    const homeSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Worthora',
      url: SITE_URL,
      description: 'Source-led product comparisons and buyer guides.'
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />;
  }

  if (type === 'post' && post) {
    const articleSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage ? [post.featuredImage.startsWith('http') ? post.featuredImage : `${SITE_URL}${post.featuredImage}`] : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      mainEntityOfPage: `${SITE_URL}/review/${encodeURIComponent(post.slug)}`,
      author: { '@type': 'Organization', name: post.author.name, url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'Worthora', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/worthora_logo.jpg` } }
    };

    const reviewedProduct = post.editorialReviewStatus === 'reviewed'
      ? post.products.find(product => product.isWinner && product.productDataStatus === 'verified' && product.asin)
      : undefined;
    const productSchema = reviewedProduct && post.evidence?.length ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: reviewedProduct.name,
      image: [post.featuredImage],
      description: reviewedProduct.summary,
      brand: { '@type': 'Brand', name: reviewedProduct.brand },
      sku: reviewedProduct.asin,
      review: {
        '@type': 'Review',
        author: { '@type': 'Organization', name: post.author.name },
        publisher: { '@type': 'Organization', name: 'Worthora' },
        datePublished: post.publishedAt,
        reviewBody: post.quickVerdict.summary
      },
      offers: reviewedProduct.price > 0 ? {
        '@type': 'Offer', priceCurrency: 'USD', price: reviewedProduct.price.toString(), url: reviewedProduct.affiliateUrl,
        availability: 'https://schema.org/InStock'
      } : undefined
    } : null;

    const breadcrumbsSchema = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: post.categoryLabel, item: `${SITE_URL}/category/${post.category}` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/review/${post.slug}` }
      ]
    };
    const faqSchema = post.faq?.length ? {
      '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: post.faq.map(item => ({
        '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    } : null;
    return <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {productSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    </>;
  }
  if (type === 'category') {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: categoryName || 'Worthora' }) }} />;
  }
  return null;
};
