import React, { useState, useEffect } from 'react';
import { 
  Table, 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Check, 
  Layers,
  ArrowUpDown,
  Send
} from 'lucide-react';
import { 
  EditorialQueueState, 
  PautaItem, 
  FonteItem, 
  RevisaoItem, 
  PublicadoItem, 
  PautaStatus, 
  CategorySlug 
} from '../types';

interface EditorialQueueSheetProps {
  onTriggerGroundedResearch?: (category: CategorySlug, topic?: string) => Promise<any>;
}

export const EditorialQueueSheet: React.FC<EditorialQueueSheetProps> = ({
  onTriggerGroundedResearch
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<'pautas' | 'fontes' | 'revisao' | 'publicado'>('pautas');
  const [queueState, setQueueState] = useState<EditorialQueueState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // New pauta modal state
  const [showNewPautaModal, setShowNewPautaModal] = useState(false);
  const [newTema, setNewTema] = useState('');
  const [newCategoria, setNewCategoria] = useState<CategorySlug>('electronics');
  const [newTipo, setNewTipo] = useState<any>('comparativo_profundo');
  const [newRisco, setNewRisco] = useState<'baixo' | 'medio' | 'alto'>('baixo');
  const [newResponsavel, setNewResponsavel] = useState('Conselho Editorial Worthora');
  const [isResearchingLive, setIsResearchingLive] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/editorial-queue');
      if (res.ok) {
        const data = await res.json();
        setQueueState(data);
      }
    } catch (err) {
      console.warn('Could not fetch queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCreatePauta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTema) return;
    try {
      const res = await fetch('/api/editorial-queue/pautas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: newTema,
          categoria: newCategoria,
          tipoConteudo: newTipo,
          status: 'nova',
          risco: newRisco,
          fontes: 0,
          responsavelRevisao: newResponsavel,
          dataPrevista: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          resumoFactual: 'Pauta cadastrada para conferência factual e grounding de fontes.'
        })
      });
      if (res.ok) {
        setFeedbackMsg('✅ Pauta adicionada com sucesso na fila editorial!');
        setShowNewPautaModal(false);
        setNewTema('');
        fetchQueue();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (pautaId: string, newStatus: PautaStatus) => {
    try {
      const res = await fetch(`/api/editorial-queue/pautas/${pautaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchQueue();
      }
    } catch (err) {}
  };

  const handleTriggerGroundedRun = async (category: CategorySlug, topic?: string) => {
    setIsResearchingLive(true);
    setFeedbackMsg('🔍 Robô inteligente iniciando Google Search Grounding...');
    try {
      const res = await fetch('/api/editorial-queue/research-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, topic })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg(`🎉 Matéria gerada com ${data.post?.sources?.length || 3} fontes citadas e salva na fila!`);
        fetchQueue();
      } else {
        setFeedbackMsg(`⚠️ ${data.error || 'Falha ao executar pesquisa'}`);
      }
    } catch (err: any) {
      setFeedbackMsg(`❌ Erro: ${err.message}`);
    } finally {
      setIsResearchingLive(false);
      setTimeout(() => setFeedbackMsg(''), 6000);
    }
  };

  const exportQueueCsv = () => {
    if (!queueState) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeSheetTab === 'pautas') {
      csvContent += 'ID,Tema,Categoria,Tipo,Status,Risco,Fontes_Qtd,Responsavel,Data_Prevista,Data_Criacao\n';
      queueState.pautas.forEach(p => {
        csvContent += `"${p.id}","${p.tema.replace(/"/g, '""')}","${p.categoria}","${p.tipoConteudo}","${p.status}","${p.risco}",${p.fontes},"${p.responsavelRevisao}","${p.dataPrevista}","${p.dataCriacao}"\n`;
      });
    } else if (activeSheetTab === 'fontes') {
      csvContent += 'ID,Dominio,Titulo,URL,Data_Consulta,Confiabilidade,Pauta_ID\n';
      queueState.fontes.forEach(f => {
        csvContent += `"${f.id}","${f.dominio}","${f.titulo.replace(/"/g, '""')}","${f.url}","${f.dataConsulta}","${f.confiabilidade}","${f.usadoEmPautaId}"\n`;
      });
    } else if (activeSheetTab === 'revisao') {
      csvContent += 'ID,Pauta_ID,Tema,Afirmacoes_Verificadas,Status_Revisao,Revisor,Data_Revisao,Parecer\n';
      queueState.revisao.forEach(r => {
        csvContent += `"${r.id}","${r.pautaId}","${r.tema.replace(/"/g, '""')}",${r.afirmacoesVerificadas},"${r.statusRevisao}","${r.revisor}","${r.dataRevisao}","${r.parecer.replace(/"/g, '""')}"\n`;
      });
    } else {
      csvContent += 'ID,Slug,Titulo,Categoria,Data_Publicacao,Fontes_Qtd,Leituras_100,Cliques_Fontes,Newsletter,CTR_GSC,Indice_Valor\n';
      queueState.publicado.forEach(pub => {
        csvContent += `"${pub.id}","${pub.slug}","${pub.titulo.replace(/"/g, '""')}","${pub.categoria}","${pub.dataPublicacao}",${pub.fontesQtd},${pub.metricasGA4?.leiturasCompletas || 0},${pub.metricasGA4?.cliquesFontesCitadas || 0},${pub.metricasGA4?.inscricoesNewsletter || 0},${pub.metricasGSC?.ctr || 0},${pub.indiceValor || 0}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fila_editorial_worthora_${activeSheetTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PautaStatus) => {
    const styles: Record<PautaStatus, string> = {
      nova: 'bg-blue-100 text-blue-800 border-blue-300',
      pesquisando: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
      rascunho: 'bg-purple-100 text-purple-800 border-purple-300',
      revisão: 'bg-orange-100 text-orange-800 border-orange-300',
      aprovada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      publicada: 'bg-emerald-600 text-white border-emerald-700',
      rejeitada: 'bg-rose-100 text-rose-800 border-rose-300'
    };
    return (
      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${styles[status] || 'bg-stone-100 text-stone-700'}`}>
        {status}
      </span>
    );
  };

  const getRiscoBadge = (risco: 'baixo' | 'medio' | 'alto') => {
    const styles = {
      baixo: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      medio: 'text-amber-700 bg-amber-50 border-amber-200',
      alto: 'text-rose-700 bg-rose-50 border-rose-200'
    };
    return (
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${styles[risco]}`}>
        Risco {risco}
      </span>
    );
  };

  const filteredPautas = (queueState?.pautas || []).filter(p => {
    const matchesSearch = p.tema.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.categoria === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredFontes = (queueState?.fontes || []).filter(f => {
    return f.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || f.dominio.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRevisao = (queueState?.revisao || []).filter(r => {
    return r.tema.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredPublicado = (queueState?.publicado || []).filter(pub => {
    return pub.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || pub.slug.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Knowledge Base Concept */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Fila Editorial & Fonte de Conhecimento
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Grounding • Fact-Checking • E-E-A-T
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Planilha de Produção & Governança Editorial
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Consulte o histórico de pautas, fontes citadas com carimbo de consulta, relatórios de revisão e métricas de valor. Nenhuma matéria é criada sem grounding prévio e sem checagem de fontes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleTriggerGroundedRun('electronics')}
            disabled={isResearchingLive}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isResearchingLive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Pesquisar & Redigir com Grounding</span>
          </button>
          <button
            onClick={() => setShowNewPautaModal(true)}
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-stone-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Pauta</span>
          </button>
          <button
            onClick={exportQueueCsv}
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-stone-700 transition"
            title="Exportar aba atual para CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} className="text-amber-700 font-bold">✕</button>
        </div>
      )}

      {/* Spreadsheet Tabs: Pautas | Fontes | Revisão | Publicado */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto">
          <button
            onClick={() => setActiveSheetTab('pautas')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
              activeSheetTab === 'pautas'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>📋 1. Pautas</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-bold">
              {queueState?.pautas.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSheetTab('fontes')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
              activeSheetTab === 'fontes'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>🔍 2. Fontes Consultadas</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-bold">
              {queueState?.fontes.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSheetTab('revisao')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
              activeSheetTab === 'revisao'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>⚖️ 3. Revisão & Fatos</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-bold">
              {queueState?.revisao.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSheetTab('publicado')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
              activeSheetTab === 'publicado'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>🚀 4. Publicado & Métricas de Valor</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-bold">
              {queueState?.publicado.length || 0}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-stone-50/60 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-stone-300 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder={`Filtrar em ${activeSheetTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-stone-800 outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeSheetTab === 'pautas' && (
              <>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="nova">Nova</option>
                  <option value="pesquisando">Pesquisando</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="revisão">Revisão</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="publicada">Publicada</option>
                  <option value="rejeitada">Rejeitada</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 outline-none"
                >
                  <option value="all">Todas Categorias</option>
                  <option value="electronics">Electronics</option>
                  <option value="tools">Tools</option>
                  <option value="clothing">Clothing</option>
                  <option value="home-decoration">Home</option>
                  <option value="personal-care">Personal Care</option>
                  <option value="books">Books</option>
                </select>
              </>
            )}

            <button
              onClick={fetchQueue}
              className="p-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-stone-600 transition"
              title="Atualizar dados da fila"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================================
            TAB 1: PAUTAS SPREADSHEET
           ======================================================== */}
        {activeSheetTab === 'pautas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 font-mono uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <th className="py-3 px-4 font-bold">ID</th>
                  <th className="py-3 px-4 font-bold min-w-[280px]">Tema / Pauta</th>
                  <th className="py-3 px-4 font-bold">Categoria</th>
                  <th className="py-3 px-4 font-bold">Tipo Conteúdo</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Risco</th>
                  <th className="py-3 px-4 font-bold text-center">Fontes</th>
                  <th className="py-3 px-4 font-bold">Responsável</th>
                  <th className="py-3 px-4 font-bold">Data Prevista</th>
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredPautas.map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-400 font-bold whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900 max-w-md">
                      <div>{p.tema}</div>
                      {p.resumoFactual && (
                        <div className="text-[11px] text-stone-500 font-normal mt-0.5 line-clamp-1">
                          {p.resumoFactual}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 text-[11px]">
                      {p.tipoConteudo.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getRiscoBadge(p.risco)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-stone-800">
                      {p.fontes}
                    </td>
                    <td className="py-3 px-4 text-stone-600 whitespace-nowrap text-[11px]">
                      {p.responsavelRevisao}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                      {p.dataPrevista}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <select
                        value={p.status}
                        onChange={e => handleUpdateStatus(p.id, e.target.value as PautaStatus)}
                        className="bg-white border border-stone-200 rounded px-2 py-1 text-[11px] font-bold text-stone-800 outline-none"
                      >
                        <option value="nova">Nova</option>
                        <option value="pesquisando">Pesquisando</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="revisão">Revisão</option>
                        <option value="aprovada">Aprovada</option>
                        <option value="publicada">Publicada</option>
                        <option value="rejeitada">Rejeitada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 2: FONTES SPREADSHEET
           ======================================================== */}
        {activeSheetTab === 'fontes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 font-mono uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <th className="py-3 px-4 font-bold">Domínio</th>
                  <th className="py-3 px-4 font-bold min-w-[260px]">Título da Documentação</th>
                  <th className="py-3 px-4 font-bold">URL</th>
                  <th className="py-3 px-4 font-bold">Carimbo da Consulta</th>
                  <th className="py-3 px-4 font-bold min-w-[240px]">Afirmações Sustentadas</th>
                  <th className="py-3 px-4 font-bold">Confiabilidade</th>
                  <th className="py-3 px-4 font-bold">Pauta Vinculada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredFontes.map(f => (
                  <tr key={f.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-800 text-[11px] whitespace-nowrap">
                      {f.dominio}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {f.titulo}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Abrir Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(f.dataConsulta).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-stone-700 text-[11px]">
                      <ul className="list-disc list-inside space-y-0.5">
                        {f.afirmacoesSustentadas.map((aff, i) => (
                          <li key={i} className="line-clamp-1">{aff}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {f.confiabilidade.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                      {f.usadoEmPautaId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 3: REVISÃO & FATOS SPREADSHEET
           ======================================================== */}
        {activeSheetTab === 'revisao' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 font-mono uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <th className="py-3 px-4 font-bold">Pauta</th>
                  <th className="py-3 px-4 font-bold min-w-[240px]">Tema Analisado</th>
                  <th className="py-3 px-4 font-bold text-center">Fatos Checados</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Checagens Editoriais</th>
                  <th className="py-3 px-4 font-bold">Status Revisão</th>
                  <th className="py-3 px-4 font-bold min-w-[240px]">Parecer Editorial</th>
                  <th className="py-3 px-4 font-bold">Revisor</th>
                  <th className="py-3 px-4 font-bold">Data Revisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredRevisao.map(r => (
                  <tr key={r.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-stone-500 whitespace-nowrap">
                      {r.pautaId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {r.tema}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-emerald-700">
                      {r.afirmacoesVerificadas} fatos
                    </td>
                    <td className="py-3 px-4 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sem testes de lab falsos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sem reviews inventados</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Links de busca / dp validados</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {r.statusRevisao}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 text-[11px] leading-relaxed">
                      {r.parecer}
                    </td>
                    <td className="py-3 px-4 text-stone-700 font-medium text-[11px] whitespace-nowrap">
                      {r.revisor}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(r.dataRevisao).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 4: PUBLICADO & MÉTRICAS DE VALOR
           ======================================================== */}
        {activeSheetTab === 'publicado' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 font-mono uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <th className="py-3 px-4 font-bold">Artigo Publicado</th>
                  <th className="py-3 px-4 font-bold">Categoria</th>
                  <th className="py-3 px-4 font-bold text-center">Fontes Qtd</th>
                  <th className="py-3 px-4 font-bold text-center">Leituras 100%</th>
                  <th className="py-3 px-4 font-bold text-center">Cliques Fontes</th>
                  <th className="py-3 px-4 font-bold text-center">Newsletter</th>
                  <th className="py-3 px-4 font-bold text-center">Shares</th>
                  <th className="py-3 px-4 font-bold text-center">GSC Cliques / Impressões</th>
                  <th className="py-3 px-4 font-bold text-right">Índice de Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredPublicado.map(pub => (
                  <tr key={pub.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-semibold text-stone-900 max-w-sm">
                      <a 
                        href={`/?p=${encodeURIComponent(pub.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-amber-600 transition inline-flex items-center gap-1.5"
                      >
                        <span className="line-clamp-1">{pub.titulo}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                      {pub.categoria}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-stone-800">
                      {pub.fontesQtd}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-emerald-700">
                      {pub.metricasGA4?.leiturasCompletas || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-amber-700">
                      {pub.metricasGA4?.cliquesFontesCitadas || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-purple-700">
                      {pub.metricasGA4?.inscricoesNewsletter || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-sky-700">
                      {pub.metricasGA4?.compartilhamentos || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-stone-600 whitespace-nowrap">
                      {pub.metricasGSC?.cliques || 0} / {pub.metricasGSC?.impressoes || 0} ({pub.metricasGSC?.ctr || 0}%)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 border border-emerald-300">
                        {pub.indiceValor || 92}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Nova Pauta */}
      {showNewPautaModal && (
        <div className="fixed inset-0 bg-stone-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Cadastrar Nova Pauta Editorial
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Pautas registradas servem como fonte de conhecimento para o robô nunca repetir temas e apurar fontes antes da redação.
            </p>

            <form onSubmit={handleCreatePauta} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tema / Assunto do Comparativo:</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sony A7 IV vs Canon EOS R6 Mark II..."
                  value={newTema}
                  onChange={e => setNewTema(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl outline-none focus:border-amber-500 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Categoria:</label>
                  <select
                    value={newCategoria}
                    onChange={e => setNewCategoria(e.target.value as CategorySlug)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl outline-none text-xs text-stone-900 bg-white"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="tools">Tools</option>
                    <option value="clothing">Clothing</option>
                    <option value="home-decoration">Home</option>
                    <option value="personal-care">Personal Care</option>
                    <option value="books">Books</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Risco Factual:</label>
                  <select
                    value={newRisco}
                    onChange={e => setNewRisco(e.target.value as any)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl outline-none text-xs text-stone-900 bg-white"
                  >
                    <option value="baixo">Baixo (Specs oficiais)</option>
                    <option value="medio">Médio (Specs + Opinião)</option>
                    <option value="alto">Alto (Lançamento recente)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Responsável pela Revisão:</label>
                <input
                  type="text"
                  value={newResponsavel}
                  onChange={e => setNewResponsavel(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl outline-none text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewPautaModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-bold hover:bg-stone-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl shadow-xs transition"
                >
                  Salvar Pauta na Fila
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
