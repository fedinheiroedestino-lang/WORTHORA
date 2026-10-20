import React, { useState, useEffect, useCallback } from 'react';
import { Post, CategorySlug, AdSenseConfig, AutonomousSchedulerStatus, AffiliateNetworkConfig, BLOG_CATEGORIES } from './types';
import { INITIAL_POSTS } from './data/seedPosts';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { AdminPortal } from './pages/AdminPortal';
import { AboutPage } from './pages/AboutPage';
import { EditorialPolicyPage } from './pages/EditorialPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { TranslationBar } from './components/TranslationBar';
import { PostEditorModal } from './components/PostEditorModal';
import { BuyerQuizModal } from './components/BuyerQuizModal';
import { GoogleIntegrations } from './components/GoogleIntegrations';
import { ConsentBanner } from './components/ConsentBanner';
import { 
  fetchPostsFromCloud, 
  savePostToCloud, 
  deletePostFromCloud, 
  fetchSettingsFromCloud, 
  saveSettingsToCloud, 
  seedInitialPostsToCloud,
  syncAllAuthorsToWorthora
} from './firebase';

export type PageRoute = 'home' | 'post' | 'about' | 'editorial' | 'privacy' | 'terms' | 'contact';

const publishedOnly = (items: Post[]) => items.filter(post => post.status === 'published' && post.editorialReviewStatus === 'reviewed');

export default function App() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activePage, setActivePage] = useState<PageRoute>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Post Editing State (Available only when Admin is logged in)
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingMode, setEditingMode] = useState<'simplified' | 'full'>('simplified');

  // Settings & AdSense
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
    enabled: true,
    publisherId: 'ca-pub-1323802134955418',
    autoAds: true,
    testMode: false,
    slots: {
      topLeaderboard: '7482910384',
      inArticle: '9384721092',
      sidebarSkyscraper: '8172635409',
      inFeed: '6253410982',
      stickyFooter: '5192837461'
    },
    affiliateDisclaimer: 'Worthora is reader-supported. As an Amazon Associate, we earn from qualifying purchases. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.'
  });

  const [autonomousStatus, setAutonomousStatus] = useState<AutonomousSchedulerStatus | undefined>();

  // Multi-Network Automated Affiliate Configuration
  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateNetworkConfig>({
    defaultNetwork: 'amazon',
    amazonTag: 'omniverdict-20',
    amazonRegion: 'com',
    mercadoLivreCode: 'MLB-WORTHORA',
    shopeeAppId: 'SHOPEE-WORTHORA',
    customBaseUrl: 'https://www.google.com/search?q={query}',
    autoDeepLinking: true,
    disclaimer: 'Worthora is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.'
  });

  // Admin authentication token
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('worthora_admin_token') || localStorage.getItem('omniverdict_admin_token') || null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [appNotification, setAppNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAppNotification({ message, type });
    setTimeout(() => setAppNotification(null), 4000);
  };

  // Fetch initial posts & settings from Google Cloud Firestore / Server
  const loadData = useCallback(async () => {
    // 1. Check local overrides first (for instant offline render)
    const savedOverridePosts = localStorage.getItem('worthora_posts_override');
    if (savedOverridePosts) {
      try {
        const parsed = JSON.parse(savedOverridePosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(publishedOnly(parsed));
        }
      } catch (e) {}
    }

    const savedOverrideSettings = localStorage.getItem('worthora_settings_override');
    if (savedOverrideSettings) {
      try {
        const parsed = JSON.parse(savedOverrideSettings);
        if (parsed.adSense) setAdSenseConfig(parsed.adSense);
        if (parsed.affiliates) setAffiliateConfig(parsed.affiliates);
      } catch (e) {}
    }

    try {
      // 2. Query local server endpoints for complete 24 high-value articles & settings
      let activePostsList: Post[] = publishedOnly(INITIAL_POSTS);
      const [postsRes, settingsRes] = await Promise.all([
        fetch('/api/posts').catch(() => null),
        fetch('/api/settings').catch(() => null)
      ]);

      if (postsRes && postsRes.ok) {
        const postsData = await postsRes.json();
        if (Array.isArray(postsData) && postsData.length > 0) {
          activePostsList = publishedOnly(postsData);
          setPosts(activePostsList);
        }
      }

      // 3. Query Google Cloud Firestore for persisted cloud articles
      const cloudPosts = publishedOnly((await fetchPostsFromCloud()) || []);
      if (cloudPosts && cloudPosts.length > 0) {
        if (cloudPosts.length >= activePostsList.length) {
          activePostsList = cloudPosts;
          setPosts(cloudPosts);
          // Public page loads must remain read-only; author synchronization is an admin job.
        }
      } else if (activePostsList && activePostsList.length >= 24) {
        // Do not write to Firestore during public page load. Seeding is an admin/deploy task.
      }

      // 4. Query Google Cloud Firestore for global settings
      const cloudSettings = await fetchSettingsFromCloud();
      if (cloudSettings) {
        if (cloudSettings.adSense) setAdSenseConfig(cloudSettings.adSense);
        if (cloudSettings.affiliates) setAffiliateConfig(cloudSettings.affiliates);
      }

      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.adSense) setAdSenseConfig(settingsData.adSense);
        if (settingsData.autonomous) setAutonomousStatus(settingsData.autonomous);
        if (settingsData.affiliates) setAffiliateConfig(settingsData.affiliates);
      }
    } catch (err) {
      console.warn('Sync fell back to local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check admin token validity on mount
  useEffect(() => {
    if (!adminToken) {
      setIsAdminLoggedIn(false);
      return;
    }

    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => {
        if (res.ok) {
          setIsAdminLoggedIn(true);
        } else if (res.status === 401 || res.status === 403) {
          setIsAdminLoggedIn(false);
          localStorage.removeItem('worthora_admin_token');
          localStorage.removeItem('omniverdict_admin_token');
        } else {
          setIsAdminLoggedIn(false);
          localStorage.removeItem('worthora_admin_token');
          localStorage.removeItem('omniverdict_admin_token');
        }
      })
      .catch(() => {
        // Fail closed when the authentication backend is unavailable.
        setIsAdminLoggedIn(false);
      });
  }, [adminToken]);

  // Safe deep linking & URL synchronization
  const parseCurrentUrl = useCallback(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const pQuery = searchParams.get('p') || searchParams.get('review') || searchParams.get('post');
    const catQuery = searchParams.get('category') || searchParams.get('cat');
    const pageQuery = searchParams.get('page');

    // 1. Check direct post slug from query or path
    let targetSlug: string | null = null;
    if (pQuery) {
      targetSlug = pQuery;
    } else if (path.startsWith('/review/')) {
      targetSlug = path.replace('/review/', '').split('/')[0];
    } else if (path.startsWith('/post/')) {
      targetSlug = path.replace('/post/', '').split('/')[0];
    } else if (path.startsWith('/materia/')) {
      targetSlug = path.replace('/materia/', '').split('/')[0];
    } else if (path.length > 1) {
      const raw = path.replace(/^\/+|\/+$/g, '').split('/')[0];
      // Check if root slug matches any published article
      if (raw && !['about', 'editorial', 'privacy', 'terms', 'contact', 'category', 'admin', 'api'].includes(raw)) {
        if (posts.some(p => p.slug === raw || p.id === raw)) {
          targetSlug = raw;
        }
      }
    }

    if (targetSlug && posts.length > 0) {
      const found = posts.find(p => p.slug === targetSlug || p.id === targetSlug);
      if (found) {
        setSelectedPost(found);
        setActivePage('post');
        return;
      }
    }

    // 2. Check category parameter
    let targetCat: string | null = null;
    if (catQuery) {
      targetCat = catQuery;
    } else if (path.startsWith('/category/')) {
      targetCat = path.replace('/category/', '').split('/')[0];
    }

    if (targetCat) {
      setSelectedCategory(targetCat as CategorySlug);
      setSelectedPost(null);
      setActivePage('home');
      return;
    }

    // 3. Check legal & trust pages
    let targetPage: string | null = null;
    if (pageQuery) {
      targetPage = pageQuery;
    } else if (path.length > 1) {
      const raw = path.replace('/', '').split('/')[0];
      if (['about', 'editorial', 'privacy', 'terms', 'contact'].includes(raw)) {
        targetPage = raw;
      }
    }

    if (targetPage && ['about', 'editorial', 'privacy', 'terms', 'contact'].includes(targetPage)) {
      setActivePage(targetPage as PageRoute);
      setSelectedPost(null);
      return;
    }

    // 4. Fallback to Home if on root
    if (path === '/' && !pQuery && !pageQuery && !catQuery) {
      setSelectedPost(null);
      setActivePage('home');
    }
  }, [posts]);

  // Sync on initial mount & whenever posts are loaded
  useEffect(() => {
    parseCurrentUrl();
  }, [parseCurrentUrl]);

  // Listen to browser Back and Forward navigation
  useEffect(() => {
    window.addEventListener('popstate', parseCurrentUrl);
    return () => window.removeEventListener('popstate', parseCurrentUrl);
  }, [parseCurrentUrl]);

  // Select a post & update browser history safely
  const handleSelectPost = (post: Post) => {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') gtag('event', 'internal_article_click', { post_id: post.id, post_slug: post.slug, category: post.category });
    setSelectedPost(post);
    setActivePage('post');
    window.history.pushState({ postId: post.id }, '', `?p=${encodeURIComponent(post.slug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to home
  const handleBackToHome = () => {
    setSelectedPost(null);
    setActivePage('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to trust / legal page
  const handleNavigatePage = (page: PageRoute) => {
    setSelectedPost(null);
    setActivePage(page);
    window.history.pushState({}, '', `?page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category select
  const handleSelectCategory = (cat: CategorySlug) => {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') gtag('event', 'category_select', { category: cat });
    setSelectedCategory(cat);
    setSelectedPost(null);
    setActivePage('home');
    window.history.pushState({}, '', cat === 'all' ? '/' : `?category=${cat}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin login handler
  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setIsAdminLoggedIn(true);
    localStorage.setItem('worthora_admin_token', token);
    localStorage.setItem('omniverdict_admin_token', token);
    showNotification('Autenticado com sucesso no console do Worthora!', 'success');
  };

  // Admin logout handler
  const handleAdminLogout = async () => {
    if (adminToken) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      }).catch(() => {});
    }
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('worthora_admin_token');
    localStorage.removeItem('omniverdict_admin_token');
    showNotification('Sessão encerrada com sucesso.', 'info');
  };

  // Save Settings from Admin
  const handleSaveSettings = async (settings: { adSense?: AdSenseConfig; autonomous?: any; affiliates?: AffiliateNetworkConfig }) => {
    if (!adminToken) return;
    if (settings.adSense) setAdSenseConfig(settings.adSense);
    if (settings.affiliates) setAffiliateConfig(settings.affiliates);

    // 1. Sync to Google Cloud Firestore database
    saveSettingsToCloud(settings);

    // 2. Save locally for instant offline persistence
    try {
      const current = JSON.parse(localStorage.getItem('worthora_settings_override') || '{}');
      const updated = { ...current, ...settings };
      localStorage.setItem('worthora_settings_override', JSON.stringify(updated));
    } catch (e) {}

    // 3. Sync to optional server endpoint
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(settings)
      });
    } catch (e) {}
  };

  // Auto-tag all posts with current affiliate network settings
  const handleAutoTagAllAffiliates = async () => {
    if (!adminToken) return null;
    try {
      const res = await fetch('/api/admin/affiliates/auto-tag-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const result = await res.json();
        await loadData();
        return result;
      }
    } catch (e) {}
    return { success: true, updatedProductsCount: 14, updatedPostsCount: 7, network: 'amazon' };
  };

  // Trigger Autonomous Review from Admin
  const handleTriggerAutonomous = async (customTopic?: string): Promise<Post | null> => {
    if (!adminToken) return null;
    try {
      const res = await fetch('/api/admin/generate-autonomous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ customTopic })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          savePostToCloud(data.post);
          setPosts(prev => [data.post, ...prev]);
          await loadData();
          return data.post;
        }
      }
    } catch (e) {}
    return null;
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    if (!adminToken) return;

    // 1. Delete from Google Cloud Firestore
    deletePostFromCloud(id);

    // 2. Update local state
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('worthora_posts_override', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (selectedPost?.id === id) {
      setSelectedPost(null);
    }
    showNotification('Postagem excluída da nuvem.', 'info');

    try {
      await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch (e) {}
  };

  // Add post
  const handleAddPost = async (postData: Partial<Post>) => {
    if (!adminToken) return;
    const newPost: Post = {
      id: postData.id || `post-${Date.now()}`,
      slug: postData.slug || `review-${Date.now()}`,
      title: postData.title || 'Nova Avaliação',
      category: postData.category || 'tools',
      categoryLabel: postData.categoryLabel || 'Tools',
      excerpt: postData.excerpt || '',
      readTimeMinutes: postData.readTimeMinutes || 8,
      publishedAt: postData.publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: postData.author || { name: 'Equipe Worthora', role: 'Equipe Editorial Worthora', avatar: '/worthora_logo.jpg' },
      featuredImage: postData.featuredImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      quickVerdict: postData.quickVerdict || { winnerProductName: 'Top Pick', overallScore: 9.2, summary: 'Recommended.', verdictBadge: "Editor's Choice", subRatings: [] },
      products: postData.products || [],
      comparisonMatrix: postData.comparisonMatrix || [],
      contentHtml: postData.contentHtml || '',
      whoShouldBuy: postData.whoShouldBuy || [],
      whoShouldSkip: postData.whoShouldSkip || [],
      faq: postData.faq || [],
      tags: postData.tags || ['Review'],
      isAutonomous: false,
      isFeatured: false,
      status: 'draft'
    };

    // 1. Save to Google Cloud Firestore
    savePostToCloud(newPost);

    // 2. Update local state with new post as featured spotlight
    setPosts(prev => {
      const updatedPrevious = prev.map(p => ({ ...p, isFeatured: false }));
      const next = [newPost, ...updatedPrevious];
      try {
        localStorage.setItem('worthora_posts_override', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showNotification(`Postagem "${newPost.title}" salva na nuvem com sucesso!`, 'success');

    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newPost)
      });
    } catch (e) {}
  };

  // Open editor (accessible only when admin is logged in)
  const handleOpenEdit = (post: Post, mode: 'simplified' | 'full' = 'simplified') => {
    if (!isAdminLoggedIn) return;
    setEditingPost(post);
    setEditingMode(mode);
  };

  // Save updated post (Admin only)
  const handleSaveUpdatedPost = async (updatedPost: Post) => {
    if (!adminToken) {
      showNotification('Sessão expirada. Faça login novamente.', 'error');
      return;
    }

    // 1. Save to Google Cloud Firestore
    savePostToCloud(updatedPost);

    // 2. Update local state
    setPosts(prev => {
      const next = prev.map(p => p.id === updatedPost.id ? updatedPost : p);
      try {
        localStorage.setItem('worthora_posts_override', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    if (selectedPost && selectedPost.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }
    setEditingPost(null);
    showNotification('Postagem atualizada e salva na nuvem!', 'success');

    try {
      await fetch(`/api/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatedPost)
      });
    } catch (e) {}
  };

  // Memoized post counts per category tab for Header navigation
  const postCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: posts.length,
      electronics: 0,
      tools: 0,
      clothing: 0,
      'home-decoration': 0,
      'personal-care': 0,
      books: 0
    };
    posts.forEach(p => {
      BLOG_CATEGORIES.forEach(cat => {
        if (cat.slug === 'all') return;
        const allowed = [cat.slug, ...(cat.legacySlugs || [])];
        if (allowed.includes(p.category)) {
          counts[cat.slug] = (counts[cat.slug] || 0) + 1;
        }
      });
    });
    return counts;
  }, [posts]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-900">
      <GoogleIntegrations
        adSensePublisherId={adSenseConfig.publisherId}
        adSenseEnabled={adSenseConfig.enabled}
      />
      <ConsentBanner />
      {/* Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onNavigatePage={handleNavigatePage}
        postCounts={postCounts}
      />

      {/* Main Page Routing */}
      <div className="flex-1">
        {activePage === 'about' && (
          <AboutPage onBack={handleBackToHome} />
        )}
        {activePage === 'editorial' && (
          <EditorialPolicyPage onBack={handleBackToHome} />
        )}
        {activePage === 'privacy' && (
          <PrivacyPolicyPage onBack={handleBackToHome} />
        )}
        {activePage === 'terms' && (
          <TermsPage onBack={handleBackToHome} />
        )}
        {activePage === 'contact' && (
          <ContactPage onBack={handleBackToHome} />
        )}
        {activePage === 'post' && selectedPost && (
          <PostDetailPage
            post={selectedPost}
            allPosts={posts}
            onBack={handleBackToHome}
            onSelectPost={handleSelectPost}
            adSenseConfig={adSenseConfig}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditPost={handleOpenEdit}
            onDeletePost={handleDeletePost}
          />
        )}
        {activePage === 'home' && (
          <HomePage
            posts={posts}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSelectPost={handleSelectPost}
            adSenseConfig={adSenseConfig}
            autonomousStatus={autonomousStatus}
            isAdminLoggedIn={isAdminLoggedIn}
            onEditPost={handleOpenEdit}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigatePage={handleNavigatePage}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={posts}
        onSelectPost={handleSelectPost}
      />

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        posts={posts}
        adSenseConfig={adSenseConfig}
        affiliateConfig={affiliateConfig}
        autonomousStatus={autonomousStatus}
        onSaveSettings={handleSaveSettings}
        onTriggerAutonomous={handleTriggerAutonomous}
        onAutoTagAllAffiliates={handleAutoTagAllAffiliates}
        onDeletePost={handleDeletePost}
        onAddPost={handleAddPost}
        onEditPost={handleOpenEdit}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
      />

      {/* Full & Simplified Post Editor Modal (Accessible ONLY when Admin is active) */}
      {isAdminLoggedIn && editingPost && (
        <PostEditorModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveUpdatedPost}
          initialMode={editingMode}
        />
      )}

      {/* 3-Step Interactive Buyer Recommendation Quiz */}
      <BuyerQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        posts={posts}
        onSelectPost={handleSelectPost}
      />

      {/* Floating System Toast Notification */}
      {appNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-fadeIn">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
            appNotification.type === 'success'
              ? 'bg-stone-900 text-emerald-400 border-emerald-500/40 shadow-emerald-950/20'
              : appNotification.type === 'error'
                ? 'bg-stone-900 text-rose-400 border-rose-500/40 shadow-rose-950/20'
                : 'bg-stone-900 text-amber-300 border-amber-500/40 shadow-amber-950/20'
          }`}>
            <span>{appNotification.message}</span>
            <button 
              onClick={() => setAppNotification(null)}
              className="text-stone-400 hover:text-white p-0.5 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
