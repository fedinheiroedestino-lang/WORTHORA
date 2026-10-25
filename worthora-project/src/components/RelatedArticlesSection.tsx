import React from 'react';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { RelatedArticleLink } from '../types';
import { trackInternalLinkClick } from '../utils/analytics';

interface RelatedArticlesSectionProps {
  relatedArticles?: RelatedArticleLink[];
  currentSlug: string;
  categoryLabel: string;
}

export const RelatedArticlesSection: React.FC<RelatedArticlesSectionProps> = ({
  relatedArticles = [],
  currentSlug,
  categoryLabel
}) => {
  if (!relatedArticles || relatedArticles.length === 0) return null;

  return (
    <section className="my-10 p-6 sm:p-7 bg-stone-100/90 rounded-2xl border border-stone-200">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h3 className="text-base sm:text-lg font-bold text-stone-900">
            Recommended Head-to-Head Tests in {categoryLabel}
          </h3>
        </div>
        <span className="text-xs text-stone-500 font-mono hidden sm:inline-block">
          Internal Worthora Library
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedArticles.map(article => (
          <a
            key={article.id}
            href={`/?p=${encodeURIComponent(article.slug)}`}
            onClick={() => trackInternalLinkClick(article.slug, currentSlug)}
            className="group bg-white rounded-xl p-4 border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {article.featuredImage && (
                <div className="w-full h-28 rounded-lg overflow-hidden mb-3 bg-stone-100">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-600 transition line-clamp-2 leading-snug">
                {article.title}
              </h4>
              {article.excerpt && (
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                {article.readTimeMinutes || 10} min read
              </span>
              <span className="text-amber-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                Read ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
