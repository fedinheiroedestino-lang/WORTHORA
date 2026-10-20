import React from 'react';
import { Star, Clock, Trophy, ArrowRight, Sparkles, Check, Edit3 } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onSelect: (post: Post) => void;
  featured?: boolean;
  isAdminLoggedIn?: boolean;
  onEdit?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onSelect, 
  featured = false,
  isAdminLoggedIn = false,
  onEdit
}) => {
  const winner = post.products.find(p => p.isWinner) || post.products[0];

  if (featured) {
    return (
      <article 
        onClick={() => onSelect(post)}
        className="group relative bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Conditional Admin Quick Edit Button */}
        {isAdminLoggedIn && onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-900 text-amber-400 hover:text-white border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-xs transition cursor-pointer"
            title="Edit Post"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}

        {/* Featured Image */}
        <div className="lg:col-span-7 relative overflow-hidden bg-stone-100 min-h-[280px] sm:min-h-[360px]">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-stone-950/70 via-transparent to-black/10"></div>
          
          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-amber-500 text-stone-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping"></span>
              Latest Lab Review
            </span>
            {post.isAutonomous && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                Google AI Daily
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
            <span className="bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded-md">
              {post.categoryLabel}
            </span>
            <div className="flex items-center gap-1 bg-amber-500/90 text-stone-950 font-bold px-2.5 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{post.quickVerdict.overallScore} / 10 Overall</span>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-600 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTimeMinutes} min bench test read</span>
              <span>•</span>
              <span>Updated {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight mb-3 group-hover:text-amber-700 transition">
              {post.title}
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed mb-6 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Winner callout box */}
            {winner && (
              <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Tested Winner</span>
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    ${winner.price.toFixed(2)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 line-clamp-1 mb-2">
                  {winner.name}
                </h4>
                <div className="space-y-1">
                  {winner.pros.slice(0, 2).map((pro, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{pro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium notranslate" translate="no">
              <div className="w-5 h-5 rounded-md overflow-hidden border border-amber-500/40 shadow-xs bg-stone-900 shrink-0 flex items-center justify-center p-0.5">
                <img 
                  src="/worthora_logo.jpg" 
                  alt="Worthora Logo"
                  className="w-full h-full object-cover rounded-xs"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/worthora_logo.jpg';
                  }}
                />
              </div>
              <span className="font-bold text-stone-900 notranslate" translate="no">
                Worthora Staff
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 group-hover:text-amber-800 transition">
              <span>Read Full Breakdown</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </span>
          </div>
        </div>
      </article>
    );
  }

  // STANDARD GRID CARD
  return (
    <article
      onClick={() => onSelect(post)}
      className="group bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail */}
        <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-104 transition duration-500"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-stone-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {post.categoryLabel}
            </span>
            {post.isAutonomous && (
              <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {isAdminLoggedIn && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="bg-stone-900/90 hover:bg-stone-900 text-amber-400 hover:text-white border border-amber-500/50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 transition cursor-pointer"
                title="Edit Post"
              >
                <Edit3 className="w-2.5 h-2.5" />
                <span>Edit</span>
              </button>
            )}
            <div className="bg-amber-500 text-stone-950 font-black text-xs px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>{post.quickVerdict.overallScore}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-[11px] text-stone-600 mb-2">
            <Clock className="w-3 h-3" />
            <span>{post.readTimeMinutes} min read</span>
            <span>•</span>
            <span>{post.products.length} Products Tested</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug line-clamp-2 mb-2 group-hover:text-amber-700 transition">
            {post.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mb-4">
            {post.excerpt}
          </p>

          {/* Winner Micro-Pill */}
          {winner && (
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/70 mb-2">
              <div className="flex items-center justify-between text-[11px] text-stone-600 mb-0.5">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  Winner
                </span>
                <span className="font-extrabold text-stone-900">
                  ${winner.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-800 line-clamp-1">
                {winner.name}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-700 font-semibold notranslate" translate="no">
          <div className="w-4 h-4 rounded-md overflow-hidden border border-amber-500/40 shadow-2xs bg-stone-900 shrink-0 flex items-center justify-center p-0.5">
            <img 
              src="/worthora_logo.jpg" 
              alt="Worthora Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/worthora_logo.jpg';
              }}
            />
          </div>
          <span className="notranslate" translate="no">Worthora Staff</span>
        </div>
        <span className="font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition">
          View Guide <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
