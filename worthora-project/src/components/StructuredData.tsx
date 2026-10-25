import React from 'react';
import { Post } from '../types';

interface StructuredDataProps {
  post?: Post;
  type: 'home' | 'post' | 'category';
  categoryName?: string;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ post, type, categoryName }) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://worthora.blog';

  if (type === 'home') {
    const homeSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Worthora',
      'url': origin,
      'description': 'Expert product reviews, head-to-head comparisons, and buying guides for electronics, tools, clothing, home decor, personal care, and books.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${origin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
    );
  }

  if (type === 'post' && post) {
    const winner = post.products.find(p => p.isWinner) || post.products[0];

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': winner ? winner.name : post.title,
      'image': [post.featuredImage],
      'description': post.excerpt,
      'brand': {
        '@type': 'Brand',
        'name': winner ? winner.brand : 'Worthora Tested'
      },
      'review': {
        '@type': 'Review',
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': post.quickVerdict.overallScore.toString(),
          'bestRating': '10',
          'worstRating': '1'
        },
        'author': {
          '@type': 'Organization',
          'name': post.author.name
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Worthora Lab',
          'url': origin
        },
        'datePublished': post.publishedAt,
        'reviewBody': post.quickVerdict.summary
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': post.quickVerdict.overallScore.toString(),
        'reviewCount': '48',
        'bestRating': '10',
        'worstRating': '1'
      },
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'USD',
        'price': winner ? winner.price.toString() : '199.00',
        'availability': 'https://schema.org/InStock',
        'url': winner ? winner.affiliateUrl : origin
      }
    };

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': post.title,
      'description': post.excerpt,
      'image': [post.featuredImage],
      'datePublished': post.publishedAt,
      'dateModified': post.updatedAt || post.publishedAt,
      'mainEntityOfPage': `${origin}/?p=${encodeURIComponent(post.slug)}`,
      'author': {
        '@type': 'Organization',
        'name': post.author.name,
        'url': origin,
        'image': post.author.avatar.startsWith('http') ? post.author.avatar : `${origin}${post.author.avatar}`
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Worthora Hardware Benchmark Lab',
        'url': origin,
        'logo': {
          '@type': 'ImageObject',
          'url': `${origin}/worthora_logo.jpg`
        }
      },
      'speakable': {
        '@type': 'SpeakableSpecification',
        'cssSelector': ['h1', '.prose-editorial h2', '.prose-editorial p']
      }
    };

    const breadcrumbsSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': origin
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': post.categoryLabel,
          'item': `${origin}/category/${post.category}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': post.title,
          'item': `${origin}/review/${post.slug}`
        }
      ]
    };

    const faqSchema = post.faq && post.faq.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': post.faq.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    } : null;

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </>
    );
  }

  return null;
};
