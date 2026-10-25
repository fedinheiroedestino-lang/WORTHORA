import React from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { AdSenseConfig, CategorySlug, Post, ProductItem } from '../types';

interface AdSenseUnitProps {
  format: 'leaderboard' | 'in-article' | 'sidebar' | 'in-feed' | 'sticky-bottom';
  config?: AdSenseConfig;
  className?: string;
  category?: CategorySlug;
  post?: Post;
  product?: ProductItem;
  productSlotIndex?: number;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({ 
  format, 
  config, 
  className = '',
  category,
  post,
  product,
  productSlotIndex = 0
}) => {
  // If explicitly disabled in settings
  if (config && !config.enabled) {
    return null;
  }

  // Determine active Amazon Affiliate Tag from localStorage or default
  const affiliateTag = (() => {
    try {
      const saved = localStorage.getItem('worthora_settings_override');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.affiliates?.amazonTag) return parsed.affiliates.amazonTag;
      }
    } catch (e) {}
    return 'omniverdict-20';
  })();

  const publisherId = config?.publisherId || 'ca-pub-1323802134955418';
  const cleanPubId = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;

  // Slot ID mapping
  const slotMap = {
    leaderboard: config?.slots?.topLeaderboard || '7482910384',
    'in-article': config?.slots?.inArticle || '9384721092',
    sidebar: config?.slots?.sidebarSkyscraper || '8172635409',
    'in-feed': config?.slots?.inFeed || '6253410982',
    'sticky-bottom': config?.slots?.stickyFooter || '5192837461'
  };
  const slotId = slotMap[format];

  const [adFilled, setAdFilled] = React.useState(false);
  const insRef = React.useRef<HTMLModElement>(null);

  // Safely trigger Google AdSense queue and monitor fill status
  React.useEffect(() => {
    if (typeof window !== 'undefined' && config?.enabled && !config?.testMode) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (err) {
        // Suppress expected duplicate ad push or adblock warnings silently
      }
    }

    const el = insRef.current;
    if (!el) return;

    const checkFill = () => {
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled') {
        setAdFilled(true);
      } else if (status === 'unfilled') {
        setAdFilled(false);
      }
    };

    checkFill();
    const observer = new MutationObserver(checkFill);
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'] });

    return () => {
      observer.disconnect();
    };
  }, [format, config?.enabled, config?.testMode]);

  // Dynamic context resolution: Resolve offer based on current Post, Product, or Category
  const activeCategory: CategorySlug = category || (post ? post.category : 'all');

  const offer = (() => {
    // 1. If explicit product is provided or post has products
    const selectedProd = product || (post?.products && post.products.length > 0 
      ? post.products[Math.min(productSlotIndex, post.products.length - 1)] 
      : null);

    if (selectedProd) {
      const isWinner = selectedProd.isWinner;
      const formattedPrice = selectedProd.price ? `$${selectedProd.price.toFixed(2)}` : '';
      return {
        headline: isWinner 
          ? `Top Pick no Laboratório: ${selectedProd.name}`
          : `Alternativa Avaliada: ${selectedProd.name}`,
        subtext: `${selectedProd.brand} • Nota ${selectedProd.rating || 9.2}/10 no teste prático. ${selectedProd.summary || 'Entrega rápida com garantia de devolução Amazon Prime.'}`,
        cta: formattedPrice ? `Ver Preço na Amazon (${formattedPrice})` : 'Conferir Oferta na Amazon',
        url: selectedProd.affiliateUrl || `https://www.amazon.com/s?k=${encodeURIComponent(selectedProd.name)}&tag=${encodeURIComponent(affiliateTag)}`,
        advertiser: `Amazon.com Oficial • ${selectedProd.brand}`
      };
    }

    // 2. Category-tailored dynamic offers for all 6 core categories
    const categoryOffers: Record<string, Record<string, { headline: string; subtext: string; cta: string; url: string; advertiser: string }>> = {
      clothing: {
        leaderboard: {
          headline: 'Amazon Fashion & Outdoor Prime Event: Jaquetas Impermeáveis e Botas com até 35% OFF',
          subtext: 'Ofertas em vestuário técnico, calçados resistentes e jeans duráveis com envio Prime.',
          cta: 'Ver Ofertas de Moda',
          url: `https://www.amazon.com/s?k=outdoor+clothing+waterproof+jackets+boots&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Fashion & Outdoor'
        },
        'in-article': {
          headline: 'Destaque em Vestuário: Roupas Térmicas, Tênis de Trilha e Jaquetas Corta-Vento',
          subtext: 'Membros Prime contam com frete grátis e devolução simples em milhares de peças.',
          cta: 'Conferir Ofertas com Prime',
          url: `https://www.amazon.com/s?k=trail+running+shoes+merino+wool+jackets&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Apparel Store'
        },
        sidebar: {
          headline: 'Botas Heritage & Calçados de Alta Durabilidade com Frete Grátis Prime',
          subtext: 'Calçados em couro legítimo e solados reforçados para trabalho e dia a dia.',
          cta: 'Explorar Calçados',
          url: `https://www.amazon.com/s?k=heritage+leather+boots+hiking+shoes&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Footwear'
        },
        'in-feed': {
          headline: 'Oferta em Roupas e Calçados Técnicos Testados para Máxima Durabilidade',
          subtext: 'Peças selecionadas com garantia de procedência e entrega expressa.',
          cta: 'Ver Menor Preço',
          url: `https://www.amazon.com/s?k=outdoor+apparel+weatherproof+pants&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Prime Deals'
        },
        'sticky-bottom': {
          headline: 'Economia em Roupas e Botas de Inverno com Envio Rápido Prime',
          subtext: 'Descontos automáticos aplicados na finalização de compra.',
          cta: 'Aproveitar Descontos',
          url: `https://www.amazon.com/s?k=winter+parka+jackets+prime+deals&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Fashion Brands'
        }
      },
      'home-decoration': {
        leaderboard: {
          headline: 'Amazon Home & Kitchen Deals: Cafeteiras Espresso Touch, Air Fryers e Utensílios com Desconto',
          subtext: 'Equipamentos premium para sua cozinha e casa com frete grátis Prime.',
          cta: 'Ver Ofertas de Casa',
          url: `https://www.amazon.com/s?k=espresso+machines+air+fryers+kitchen+appliances&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Home & Living'
        },
        'in-article': {
          headline: 'Aspiradores Robô com Mop Autônomo e Purificadores True HEPA em Promoção',
          subtext: 'Ambientes limpos com tecnologia inteligente e cupons de desconto ativados.',
          cta: 'Conferir Robôs Aspiradores',
          url: `https://www.amazon.com/s?k=robot+vacuum+mop+air+purifiers&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Smart Appliances'
        },
        sidebar: {
          headline: 'Iluminação Inteligente e Automação Residencial Compatível com Alexa',
          subtext: 'Kits de lâmpadas LED conectadas e fitas de iluminação ambiente.',
          cta: 'Ver Dispositivos Smart',
          url: `https://www.amazon.com/s?k=smart+home+lighting+alexa+devices&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Smart Living'
        },
        'in-feed': {
          headline: 'Liquidificadores de Alta Potência e Utensílios Culinários com Garantia',
          subtext: 'Prepare receitas com motores profissionais e durabilidade testada em laboratório.',
          cta: 'Ver Liquidificadores',
          url: `https://www.amazon.com/s?k=professional+countertop+blenders+kitchen&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Culinary Verified'
        },
        'sticky-bottom': {
          headline: 'Ofertas Relâmpago em Eletrodomésticos e Móveis de Escritório Ergonômicos',
          subtext: 'Parcelamento sem juros e entrega expressa para clientes Prime.',
          cta: 'Ver Ofertas Agora',
          url: `https://www.amazon.com/s?k=ergonomic+office+chairs+home+appliances&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Home Official'
        }
      },
      'personal-care': {
        leaderboard: {
          headline: 'Amazon Beauty & Grooming: Barbeadores Elétricos, Secadores Iônicos e Escovas Inteligentes',
          subtext: 'Tecnologia de ponta para cuidados diários e higiene pessoal de alto rendimento.',
          cta: 'Ver Ofertas de Cuidado Pessoal',
          url: `https://www.amazon.com/s?k=electric+shavers+hair+dryers+sonic+toothbrushes&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Personal Care'
        },
        'in-article': {
          headline: 'Pistolas de Massagem Percussiva e Irrigadores Orais para Recuperação e Saúde',
          subtext: 'Dispositivos de terapia muscular e cuidado com a gengiva recomendados por especialistas.',
          cta: 'Conferir Terapia Muscular',
          url: `https://www.amazon.com/s?k=massage+guns+water+flossers+oral+care&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Wellness Deals'
        },
        sidebar: {
          headline: 'Depiladores de Luz Pulsada IPL e Modeladores Térmicos Multifuncionais',
          subtext: 'Resultados duradouros sem sair de casa com proteção térmica avançada.',
          cta: 'Ver Depiladores e Modeladores',
          url: `https://www.amazon.com/s?k=ipl+hair+removal+multi+styler+hair&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Beauty Tech'
        },
        'in-feed': {
          headline: 'Barbeadores Wet & Dry e Lâminas de Precisão com Frete Grátis Prime',
          subtext: 'Barbear suave e sem irritação para peles sensíveis.',
          cta: 'Ver Barbeadores em Oferta',
          url: `https://www.amazon.com/s?k=foil+shavers+rotary+shavers+grooming&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Men Grooming'
        },
        'sticky-bottom': {
          headline: 'Cuidados Pessoais e Aparelhos de Higiene com Cupons de Desconto Prime',
          subtext: 'Descontos ativados diretamente no carrinho.',
          cta: 'Ver Menor Preço',
          url: `https://www.amazon.com/s?k=smart+electric+toothbrush+hair+dryer&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Prime Care'
        }
      },
      books: {
        leaderboard: {
          headline: 'Amazon Livros & E-Readers: Kindle Paperwhite Signature e Best-Sellers com Desconto',
          subtext: 'Milhares de títulos físicos e digitais com entrega rápida para assinantes Prime.',
          cta: 'Ver Ofertas de Livros',
          url: `https://www.amazon.com/s?k=kindle+paperwhite+bestselling+books&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Books & Kindle'
        },
        'in-article': {
          headline: 'Livros de Finanças, Hábitos, Foco e Desenvolvimento Pessoal Mais Vendidos',
          subtext: 'Obras consagradas para transformar sua carreira, mentalidade e produtividade.',
          cta: 'Explorar Best-Sellers',
          url: `https://www.amazon.com/s?k=atomic+habits+psychology+of+money+deep+work+books&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Editorial Picks'
        },
        sidebar: {
          headline: 'Tablets de Tinta Eletrônica E-Ink e E-Readers com Iluminação Ajustável',
          subtext: 'Leia por semanas com uma única recarga e conforto visual semelhante ao papel real.',
          cta: 'Ver E-Readers E-Ink',
          url: `https://www.amazon.com/s?k=kindle+e+reader+e+ink+tablets&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Devices Official'
        },
        'in-feed': {
          headline: 'Guias de Negociação, Estratégia e Liderança com Entrega Expressa Prime',
          subtext: 'Leituras recomendadas pelos maiores empreendedores e pensadores globais.',
          cta: 'Ver Coleção de Livros',
          url: `https://www.amazon.com/s?k=business+strategy+leadership+books&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Books Prime'
        },
        'sticky-bottom': {
          headline: 'Ofertas em Livros Físicos e Acessórios de Leitura com Frete Prime',
          subtext: 'Capa magnética, suportes e carregadores sem fio para e-readers.',
          cta: 'Aproveitar Ofertas de Livros',
          url: `https://www.amazon.com/s?k=kindle+accessories+bestsellers&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Books Official'
        }
      },
      electronics: {
        leaderboard: {
          headline: 'Amazon Tech Deals: Fones com Cancelamento de Ruído, Smart TVs OLED e Gadgets',
          subtext: 'Descontos de até $150 em eletrônicos de marcas como Sony, Bose, Apple e LG.',
          cta: 'Ver Ofertas Tech',
          url: `https://www.amazon.com/s?k=noise+cancelling+headphones+oled+tv+laptops&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Electronics'
        },
        'in-article': {
          headline: 'Notebooks Ultrafinos, Microfones de Estúdio e Drones 4K com Descontos Exclusivos',
          subtext: 'Máxima produtividade e criação de conteúdo com frete grátis Prime.',
          cta: 'Conferir Gadgets',
          url: `https://www.amazon.com/s?k=macbook+air+studio+microphone+4k+drones&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Tech Deals'
        },
        sidebar: {
          headline: 'Caixas de Som Dolby Atmos e Soundbars de Alta Definição com Frete Prime',
          subtext: 'Transforme sua sala em uma experiência de cinema com áudio imersivo.',
          cta: 'Ver Soundbars',
          url: `https://www.amazon.com/s?k=dolby+atmos+soundbar+home+audio&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Audio'
        },
        'in-feed': {
          headline: 'Smartwatches Esportivos e Acessórios de Tecnologia com Envio Rápido',
          subtext: 'Monitore treinos, GPS e batimentos com baterias de longa duração.',
          cta: 'Ver Smartwatches',
          url: `https://www.amazon.com/s?k=smartwatch+gps+fitness+tracker&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Gadgets Prime'
        },
        'sticky-bottom': {
          headline: 'Fones Wireless e Gadgets Eletrônicos com Descontos Imediatos',
          subtext: 'Garantia de originalidade e envio rápido Amazon Prime.',
          cta: 'Ver Descontos Tech',
          url: `https://www.amazon.com/s?k=wireless+earbuds+tech+gadgets&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Electronics Verified'
        }
      },
      tools: {
        leaderboard: {
          headline: 'Home Depot & Amazon Pro Tool Event: Kits de Furadeiras e Chaves de Impacto a Bateria',
          subtext: 'Entrega rápida em 2 dias para kits profissionais DeWalt, Milwaukee e Makita.',
          cta: 'Ver Ofertas de Ferramentas',
          url: `https://www.amazon.com/s?k=cordless+hammer+drills+impact+drivers+kits&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon & Hardware Partners'
        },
        'in-article': {
          headline: 'Serras de Esquadria, Trenas Laser e Ferramentas Profissionais com Prime',
          subtext: 'Alta precisão e torque robusto para marcenaria e obras residenciais.',
          cta: 'Conferir Ferramentas',
          url: `https://www.amazon.com/s?k=miter+saw+laser+measure+power+tools&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Pro Hardware'
        },
        sidebar: {
          headline: 'Lavadoras de Alta Pressão e Caixas Modulares de Ferramentas Resistentes',
          subtext: 'Sistemas de organização de oficina e limpeza pesada de calçadas.',
          cta: 'Ver Caixas de Ferramentas',
          url: `https://www.amazon.com/s?k=modular+tool+box+pressure+washers&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Workshop Deals'
        },
        'in-feed': {
          headline: 'Baterias de Alta Densidade e Kits Starter para Oficinas Mecânicas',
          subtext: 'Mais autonomia e recarga rápida para ferramentas sem fio.',
          cta: 'Ver Baterias Pro',
          url: `https://www.amazon.com/s?k=lithium+ion+tool+batteries+starter+kit&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Hardware Verified'
        },
        'sticky-bottom': {
          headline: 'Feirão de Ferramentas a Bateria com Descontos e Envio Gratuito Prime',
          subtext: 'Kits completos prontos para uso profissional.',
          cta: 'Aproveitar Ofertas de Ferramentas',
          url: `https://www.amazon.com/s?k=cordless+power+tools+combo+kit&tag=${encodeURIComponent(affiliateTag)}`,
          advertiser: 'Amazon Tool Center'
        }
      }
    };

    const catKey = categoryOffers[activeCategory] ? activeCategory : 'tools';
    const catMap = categoryOffers[catKey] || categoryOffers.tools;
    return catMap[format] || catMap.leaderboard;
  })();

  // LEADERBOARD BANNER (728x90 desktop / 320x50 mobile)
  if (format === 'leaderboard') {
    return (
      <aside aria-label="Sponsored Recommendation" className={`w-full my-2.5 flex flex-col items-center ${className}`}>
        {/* Official Google AdSense Tag (Hidden with 0px until filled to prevent empty white space) */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ 
            display: adFilled ? 'block' : 'none', 
            width: '100%',
            height: adFilled ? 'auto' : 0,
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}
          data-ad-client={cleanPubId}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />

        <div className="w-full max-w-5xl bg-white border border-stone-200/90 rounded-xl p-2.5 sm:px-5 sm:py-2.5 shadow-2xs hover:border-amber-400/60 transition">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1 px-0.5">
            <span className="flex items-center gap-1.5 font-bold text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              {offer.advertiser} • Verificado Amazon Prime
            </span>
            <span className="flex items-center gap-1 text-stone-400 hover:text-stone-600">
              <span>Publicidade Parceira</span>
              <Info className="w-3 h-3 text-stone-400" />
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/90 p-2 sm:px-4 sm:py-2 rounded-lg border border-stone-200/70">
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-1">
                {offer.headline}
              </h4>
              <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                {offer.subtext}
              </p>
            </div>
            <a
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-4 py-2 rounded-lg transition shadow-xs whitespace-nowrap active:scale-98 shrink-0"
            >
              <span>{offer.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // IN-ARTICLE NATIVE DISPLAY BANNER
  if (format === 'in-article') {
    return (
      <aside aria-label="Sponsored In-Article Offer" className={`my-6 ${className}`}>
        {/* Official Google AdSense Tag (Hidden with 0px until filled to prevent empty white space) */}
        <ins
          className="adsbygoogle"
          style={{ 
            display: adFilled ? 'block' : 'none', 
            width: '100%', 
            height: adFilled ? 'auto' : 0,
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            textAlign: 'center' 
          }}
          data-ad-client={cleanPubId}
          data-ad-slot={slotId}
          data-ad-format="fluid"
          data-ad-layout="in-article"
        />

        <div className="p-3.5 sm:p-4 bg-linear-to-r from-amber-500/10 via-stone-50 to-amber-50/40 border border-amber-300/60 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase tracking-wider mb-2">
            <span className="font-bold text-amber-800">Oferta Verificada • Amazon Prime</span>
            <span className="flex items-center gap-1 text-stone-400">
              <span>Anúncio Parceiro</span>
              <Info className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="p-3.5 bg-white rounded-lg border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {offer.advertiser}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-stone-900">
                {offer.headline}
              </h4>
              <p className="text-xs text-stone-600">
                {offer.subtext}
              </p>
            </div>
            <a
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full md:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition shadow-xs whitespace-nowrap shrink-0"
            >
              <span>{offer.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    );
  }

  // SIDEBAR SKYSCRAPER (300x600 or 300x250)
  if (format === 'sidebar') {
    return (
      <aside aria-label="Sponsored Sidebar Banner" className={`bg-white border border-stone-200 rounded-xl p-3 shadow-2xs ${className}`}>
        {/* Official Google AdSense Tag */}
        <ins
          className="adsbygoogle"
          style={{ 
            display: adFilled ? 'block' : 'none', 
            width: '100%',
            height: adFilled ? 'auto' : 0,
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}
          data-ad-client={cleanPubId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase mb-2">
          <span className="font-bold text-amber-700">Destaque Amazon</span>
          <span className="text-stone-400">Patrocinado</span>
        </div>
        <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200/80 flex flex-col items-center text-center space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-base shadow-2xs">
            %
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            {offer.advertiser}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
            {offer.headline}
          </h4>
          <p className="text-[11px] text-stone-600 line-clamp-2">
            {offer.subtext}
          </p>
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs py-2 px-3 rounded-lg transition shadow-xs inline-flex items-center justify-center gap-1.5"
          >
            <span>{offer.cta}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    );
  }

  // IN-FEED CARD (Native style between review cards)
  if (format === 'in-feed') {
    return (
      <aside aria-label="Sponsored Native In-Feed" className={`bg-linear-to-r from-amber-500/10 via-stone-50 to-stone-100 border border-amber-300/70 rounded-xl p-4 sm:p-5 shadow-2xs transition hover:border-amber-400 ${className}`}>
        {/* Official Google AdSense Tag */}
        <ins
          className="adsbygoogle"
          style={{ 
            display: adFilled ? 'block' : 'none', 
            width: '100%',
            height: adFilled ? 'auto' : 0,
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}
          data-ad-client={cleanPubId}
          data-ad-slot={slotId}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
        />

        <div className="flex items-center justify-between text-[10px] font-mono text-amber-900 uppercase tracking-widest mb-2">
          <span className="font-bold bg-amber-200/80 px-2 py-0.5 rounded">Oferta Recomendada com Prime</span>
          <span className="text-stone-500">{offer.advertiser}</span>
        </div>
        <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
          {offer.headline}
        </h4>
        <p className="text-xs sm:text-sm text-stone-600 mb-3">
          {offer.subtext}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
          <span className="text-xs text-emerald-700 font-semibold">✓ Verificado Amazon Prime</span>
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs"
          >
            <span>{offer.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    );
  }

  // STICKY BOTTOM ANCHOR
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-amber-500/40 px-4 py-2.5 shadow-2xl text-white ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
            Ad
          </span>
          <p className="font-medium truncate">
            {offer.headline}
          </p>
        </div>
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="shrink-0 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1 rounded text-xs transition"
        >
          {offer.cta}
        </a>
      </div>
    </div>
  );
};
