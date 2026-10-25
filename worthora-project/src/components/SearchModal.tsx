import React, { useState, useEffect } from 'react';
import { Search, X, Star, ArrowRight, Sparkles } from 'lucide-react';
import { Post, CategorySlug, BLOG_CATEGORIES } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');

  const filteredPosts = posts.filter(post => {
    const catConfig = BLOG_CATEGORIES.find(c => c.slug === selectedCategory);
    const allowedSlugs: string[] = catConfig
      ? [catConfig.slug, ...(catConfig.legacySlugs || [])]
      : [selectedCategory];
    const matchesCategory = selectedCategory === 'all' || allowedSlugs.includes(post.category);
    if (!matchesCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.categoryLabel.toLowerCase().includes(q) ||
      post.tags.some(t => t.toLowerCase().includes(q)) ||
      post.products.some(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Enter' && isOpen && filteredPosts.length > 0) {
        onSelectPost(filteredPosts[0]);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredPosts, onSelectPost]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search drills, espresso machines, ANC headphones, vacuums..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-stone-900 placeholder:text-stone-400 text-sm sm:text-base outline-hidden font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 font-mono px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {([
            { slug: 'all', label: 'All Reviews' },
            { slug: 'electronics', label: 'Electronics' },
            { slug: 'tools', label: 'Tools' },
            { slug: 'clothing', label: 'Clothing' },
            { slug: 'home-decoration', label: 'Home and Decoration' },
            { slug: 'personal-care', label: 'Personal Care' },
            { slug: 'books', label: 'Books' }
          ] as const).map(cat => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug as any)}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.slug 
                  ? 'bg-stone-900 text-white' 
                  : 'bg-stone-200/70 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-semibold text-stone-700">No review guides found</p>
              <p className="text-xs text-stone-400">Try searching for &quot;DeWalt&quot;, &quot;espresso&quot;, &quot;ANC&quot;, or &quot;vacuum&quot;</p>
            </div>
          ) : (
            filteredPosts.map(post => {
              const winner = post.products.find(p => p.isWinner) || post.products[0];
              return (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post);
                    onClose();
                  }}
                  className="group p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {post.categoryLabel}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{post.quickVerdict.overallScore}/10</span>
                        </div>
                        {post.isAutonomous && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1 rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-amber-700 transition">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1">
                        Winner: <strong className="text-stone-700">{winner?.name}</strong> • {post.readTimeMinutes} min read
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
