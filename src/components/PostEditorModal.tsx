import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  Sliders, 
  FileText, 
  DollarSign, 
  Link, 
  Image, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Post, CategorySlug } from '../types';

interface PostEditorModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: Post) => Promise<void> | void;
  initialMode?: 'simplified' | 'full';
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
  initialMode = 'simplified'
}) => {
  if (!isOpen || !post) return null;

  const [mode, setMode] = useState<'simplified' | 'full'>(initialMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [category, setCategory] = useState<CategorySlug>(post.category);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage);
  const [status, setStatus] = useState<'published' | 'draft'>(post.status || 'published');
  const [overallScore, setOverallScore] = useState(post.quickVerdict?.overallScore ?? 9.0);
  const [verdictBadge, setVerdictBadge] = useState(post.quickVerdict?.verdictBadge ?? "Editor's Choice");
  const [verdictSummary, setVerdictSummary] = useState(post.quickVerdict?.summary ?? '');

  // Winner Product State (Simplified)
  const winner = post.products?.[0] || {
    id: `prod-1`,
    name: 'Top Rated Product',
    brand: 'Leading Brand',
    model: 'Pro Model',
    price: 199.99,
    rating: 9.5,
    awardBadge: 'Best Overall Pick',
    affiliateUrl: 'https://amazon.com',
    buyRetailer: 'Amazon',
    image: post.featuredImage,
    summary: '',
    keySpecs: {},
    pros: ['Heavy-duty build', 'Exceptional battery life'],
    cons: ['Slightly heavier'],
    isWinner: true
  };

  const [productName, setProductName] = useState(winner.name);
  const [productBrand, setProductBrand] = useState(winner.brand);
  const [productPrice, setProductPrice] = useState(winner.price);
  const [affiliateUrl, setAffiliateUrl] = useState(winner.affiliateUrl);
  const [buyRetailer, setBuyRetailer] = useState(winner.buyRetailer);
  
  // Pros and Cons lists
  const [pros, setPros] = useState<string[]>(winner.pros || []);
  const [newPro, setNewPro] = useState('');
  const [cons, setCons] = useState<string[]>(winner.cons || []);
  const [newCon, setNewCon] = useState('');

  // Full Mode State
  const [contentHtml, setContentHtml] = useState(post.contentHtml || '');
  const [whoShouldBuy, setWhoShouldBuy] = useState<string[]>(post.whoShouldBuy || []);
  const [newBuyer, setNewBuyer] = useState('');
  const [whoShouldSkip, setWhoShouldSkip] = useState<string[]>(post.whoShouldSkip || []);
  const [newSkipper, setNewSkipper] = useState('');
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(post.faq || []);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const handleAddPro = () => {
    if (!newPro.trim()) return;
    setPros([...pros, newPro.trim()]);
    setNewPro('');
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddCon = () => {
    if (!newCon.trim()) return;
    setCons([...cons, newCon.trim()]);
    setNewCon('');
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFaqs([...faqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const categoryLabelMap: Record<CategorySlug, string> = {
        'all': 'All Reviews',
        'electronics': 'Electronics',
        'tools': 'Tools',
        'clothing': 'clothing',
        'home-decoration': 'Home and Decoration',
        'personal-care': 'Personal Care',
        'books': 'books',
        // Legacy fallbacks:
        'power-tools': 'Tools',
        'smart-home': 'Electronics',
        'kitchen-appliances': 'Home and Decoration',
        'home-utilities': 'Tools',
        'outdoor-gear': 'Tools'
      };

      // Build updated post object
      const updatedProducts = post.products && post.products.length > 0 
        ? post.products.map((p, idx) => {
            if (idx === 0) {
              return {
                ...p,
                name: productName,
                brand: productBrand,
                price: Number(productPrice),
                affiliateUrl,
                buyRetailer,
                pros,
                cons
              };
            }
            return p;
          })
        : [{
            ...winner,
            name: productName,
            brand: productBrand,
            price: Number(productPrice),
            affiliateUrl,
            buyRetailer,
            pros,
            cons
          }];

      const updatedPost: Post = {
        ...post,
        title,
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        categoryLabel: categoryLabelMap[category] || 'Equipment Review',
        excerpt,
        featuredImage,
        status,
        updatedAt: new Date().toISOString(),
        quickVerdict: {
          ...post.quickVerdict,
          summary: verdictSummary || excerpt,
          overallScore: Number(overallScore),
          verdictBadge,
          winnerProductName: productName
        },
        products: updatedProducts,
        contentHtml: contentHtml || post.contentHtml,
        whoShouldBuy,
        whoShouldSkip,
        faq: faqs
      };

      await onSave(updatedPost);
      onClose();
    } catch (err: any) {
      console.error('Error saving post:', err);
      setErrorMsg(err.message || 'Falha ao salvar as alterações do post.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header & Mode Toggle Switch */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              {mode === 'simplified' ? <Sliders className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Editar Postagem</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-stone-700">
                  {mode === 'simplified' ? 'Modo Simplificado' : 'Modo Completo'}
                </span>
              </h3>
              <p className="text-xs text-stone-400 truncate max-w-[280px] sm:max-w-md">
                {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mode Switcher Pills */}
            <div className="bg-stone-800 p-1 rounded-xl flex items-center gap-1 border border-stone-700">
              <button
                type="button"
                onClick={() => setMode('simplified')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'simplified'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Simplificado
              </button>
              <button
                type="button"
                onClick={() => setMode('full')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'full'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Completo
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time SEO & E-E-A-T Quality Meter Banner */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-stone-900">Validador SEO em Tempo Real:</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-stone-500">Título:</span>
                <span className={`font-bold ${title.length >= 30 && title.length <= 65 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {title.length}c {title.length >= 30 && title.length <= 65 ? '✓ Ideal' : '(30-60 ideal)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-stone-500">Resumo:</span>
                <span className={`font-bold ${excerpt.length >= 80 && excerpt.length <= 165 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {excerpt.length}c {excerpt.length >= 80 && excerpt.length <= 165 ? '✓ Ideal' : '(120-160 ideal)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-stone-500">Afiliado:</span>
                <span className={`font-bold ${affiliateUrl?.startsWith('http') ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {affiliateUrl?.startsWith('http') ? '✓ Válido' : '⚠ Sem link'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              SIMPLIFIED MODE FIELDS (Fast, clear, essential)
             ======================================================== */}
          <div className="space-y-4">
            <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                Dados Principais da Postagem
              </h4>
              <span className="text-[11px] text-stone-600">Essencial para exibição e SEO</span>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Título do Artigo / Comparativo
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:border-amber-500 outline-hidden transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as CategorySlug)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:border-amber-500 outline-hidden cursor-pointer"
                >
                  <option value="electronics">Electronics</option>
                  <option value="tools">Tools</option>
                  <option value="clothing">clothing</option>
                  <option value="home-decoration">Home and Decoration</option>
                  <option value="personal-care">Personal Care</option>
                  <option value="books">books</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Status de Publicação
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-bold outline-hidden cursor-pointer ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <option value="published">Publicado (Ao Vivo)</option>
                  <option value="draft">Rascunho Interno</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nota Editorial (0 a 10)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={overallScore}
                    onChange={e => setOverallScore(parseFloat(e.target.value))}
                    className="w-16 px-2 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-emerald-700 text-center focus:bg-white focus:border-amber-500 outline-hidden"
                  />
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.1"
                    value={overallScore}
                    onChange={e => setOverallScore(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Resumo / Veredito Editorial
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Breve resumo da conclusão dos testes..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                URL da Imagem de Destaque
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={featuredImage}
                  onChange={e => setFeaturedImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 focus:bg-white focus:border-amber-500 outline-hidden"
                />
                {featuredImage && (
                  <img 
                    src={featuredImage} 
                    alt="Preview" 
                    className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Product & Monetization Specs (Simplified) */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                Produto Vencedor & Monetização de Afiliado
              </h4>
              <span className="text-[11px] text-stone-600">Links para Amazon, Home Depot, etc.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nome do Produto Principal
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Preço Recomendado (USD $)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productPrice}
                  onChange={e => setProductPrice(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:bg-white focus:border-amber-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Loja / Revendedor (ex: Amazon, The Home Depot)
                </label>
                <input
                  type="text"
                  value={buyRetailer}
                  onChange={e => setBuyRetailer(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Link de Afiliado / Compra
                </label>
                <input
                  type="url"
                  value={affiliateUrl}
                  onChange={e => setAffiliateUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 focus:bg-white focus:border-amber-500 outline-hidden"
                />
              </div>
            </div>

            {/* Pros and Cons Quick Manager */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Pros */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-emerald-950 block">
                  Pontos Fortes (Prós)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {pros.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                      <span className="text-emerald-950">{p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePro(idx)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar novo pró..."
                    value={newPro}
                    onChange={e => setNewPro(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPro(); }}}
                    className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPro}
                    className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cons */}
              <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-rose-950 block">
                  Pontos Fracos (Contras)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cons.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-rose-100 shadow-2xs">
                      <span className="text-rose-950">{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCon(idx)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar novo contra..."
                    value={newCon}
                    onChange={e => setNewCon(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCon(); }}}
                    className="flex-1 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCon}
                    className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              FULL MODE FIELDS (Available in Full Mode)
             ======================================================== */}
          {mode === 'full' && (
            <div className="space-y-6 pt-4 border-t border-stone-200">
              <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                  Conteúdo Editorial Completo (HTML / Lab Report)
                </h4>
                <span className="text-[11px] text-stone-600">Compatível com Google AdSense (1.000+ palavras)</span>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Corpo do Artigo / Relatório de Bancada (HTML)
                </label>
                <textarea
                  rows={10}
                  value={contentHtml}
                  onChange={e => setContentHtml(e.target.value)}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:border-amber-500 outline-hidden leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-stone-600 mt-1">
                  <span>Suporta tags padrão HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</span>
                  <span>Palavras aproximadas: {contentHtml.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">
                    Perguntas Frequentes (FAQ Schema para Google)
                  </label>
                  <span className="text-[11px] text-stone-600">{faqs.length} itens configurados</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {faqs.map((f, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span>P: {f.question}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-stone-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-stone-600">R: {f.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-stone-100 rounded-xl space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Pergunta..."
                    value={newFaqQ}
                    onChange={e => setNewFaqQ(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Resposta técnica..."
                      value={newFaqA}
                      onChange={e => setNewFaqA(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 cursor-pointer"
                    >
                      Adicionar FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
