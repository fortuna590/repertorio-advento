import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Trash2, Edit, Music, BookOpen, Save, X, ExternalLink, Eye, Upload, ImageIcon, BarChart2, Pencil } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type Tab = "repertorios" | "blog";

const TEMPOS = ["ADVENTO","NATAL","QUARESMA","PASCOA","TEMPO_COMUM","CELEBRACOES","GERAL"];
// Momentos agora vêm do banco de dados dinamicamente

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("repertorios");

  if (loading) return <div className="container py-20 text-center text-white/50">Carregando...</div>;
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Acesso restrito</h1>
        <Link href="/" className="text-purple-400 hover:text-purple-300">← Voltar ao início</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Painel Admin" description="Painel de administração do LouvaMais" />
      <div className="container py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-white/50 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-3xl font-black text-white">Painel <span className="gradient-text">Admin</span></h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab("repertorios")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab==="repertorios" ? "bg-purple-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"}`}>
            <Music className="w-4 h-4" />Repertórios
          </button>
          <button onClick={() => setTab("blog")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab==="blog" ? "bg-purple-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"}`}>
            <BookOpen className="w-4 h-4" />Blog
          </button>
          <Link href="/admin/analytics"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all">
            <BarChart2 className="w-4 h-4" />Analytics
          </Link>
        </div>

        {tab === "repertorios" && <RepertoriosAdmin />}
        {tab === "blog" && <BlogAdmin />}
      </div>
    </>
  );
}

function RepertoriosAdmin() {
  const utils = trpc.useUtils();
  const { data: lista, isLoading } = trpc.admin.listarRepertorios.useQuery();
  const deletar = trpc.admin.deletarRepertorio.useMutation({ onSuccess: () => utils.admin.listarRepertorios.invalidate() });
  const [editando, setEditando] = useState<any>(null);
  const [criando, setCriando] = useState(false);

  if (isLoading) return <div className="text-white/50">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Repertórios ({lista?.length || 0})</h2>
        <button onClick={() => setCriando(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
          <Plus className="w-4 h-4" />Novo Repertório
        </button>
      </div>

      {(criando || editando) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="w-full max-w-2xl">
            <RepertorioForm
              inicial={editando}
              onClose={() => { setCriando(false); setEditando(null); }}
              onSaved={() => { setCriando(false); setEditando(null); utils.admin.listarRepertorios.invalidate(); }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {lista?.map(r => (
          <div key={r.id} className="card-glass rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300">{r.tempoLiturgico}</span>
                <h3 className="text-sm font-semibold text-white truncate">{r.titulo}</h3>
              </div>
              <p className="text-xs text-white/40">{r.categoria}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditando(r)} className="p-2 rounded-lg text-purple-400 hover:bg-purple-600/10 transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => deletar.mutate({ id: r.id })} className="p-2 rounded-lg text-red-400 hover:bg-red-600/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepertorioForm({ inicial, onClose, onSaved }: { inicial?: any; onClose: () => void; onSaved: () => void }) {
  const criar = trpc.admin.criarRepertorio.useMutation({ onSuccess: () => onSaved() });
  const editar = trpc.admin.editarRepertorio.useMutation({ onSuccess: () => onSaved() });
  const { data: tiposRepertorio } = trpc.momentos.listarTipos.useQuery();
  
  const [form, setForm] = useState({
    titulo: inicial?.titulo || "",
    tempoLiturgico: inicial?.tempoLiturgico || "ADVENTO",
    tipoRepertorioId: inicial?.tipoRepertorioId || 1,
    categoria: inicial?.categoria || "",
    descricao: inicial?.descricao || "",
    metaTitle: inicial?.metaTitle || "",
    metaDescription: inicial?.metaDescription || "",
    palavrasChave: inicial?.palavrasChave || "",
  });

  const { data: momentosPorTipo } = trpc.momentos.listarPorTipo.useQuery(
    { tipoRepertorioId: form.tipoRepertorioId || 1 },
    { enabled: !!form.tipoRepertorioId }
  );

  const [musicas, setMusicas] = useState<any[]>(inicial?.musicas || []);
  const [novaMusica, setNovaMusica] = useState({ titulo: "", artista: "", tom: "", momentoId: momentosPorTipo?.[0]?.id || 1, youtube: "", cifra: "", letra: "" });
  const [editandoMusica, setEditandoMusica] = useState<number | null>(null);
  const [musicaEditada, setMusicaEditada] = useState<any>(null);
  
  const iniciarEdicaoMusica = (i: number) => {
    setEditandoMusica(i);
    setMusicaEditada({ ...musicas[i] });
  };
  
  const salvarEdicaoMusica = () => {
    if (editandoMusica === null || !musicaEditada) return;
    const novas = [...musicas];
    novas[editandoMusica] = musicaEditada;
    setMusicas(novas);
    setEditandoMusica(null);
    setMusicaEditada(null);
  };

  const salvar = () => {
    const payload = { ...form, musicas };
    if (inicial) editar.mutate({ id: inicial.id, ...payload });
    else criar.mutate(payload);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{inicial ? "Editar Repertório" : "Novo Repertório"}</h3>
        <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Título *</label>
          <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="Título do repertório" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Tipo de Repertório *</label>
          <select value={form.tipoRepertorioId} onChange={e => setForm({...form, tipoRepertorioId: parseInt(e.target.value)})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer">
            <option value="">Selecione um tipo</option>
            {tiposRepertorio?.map(t => <option key={t.id} value={t.id} style={{backgroundColor: '#1e293b', color: '#fff'}}>{t.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Tempo Litúrgico *</label>
          <select value={form.tempoLiturgico} onChange={e => setForm({...form, tempoLiturgico: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer">
            {TEMPOS.map(t => <option key={t} value={t} style={{backgroundColor: '#1e293b', color: '#fff'}}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Categoria</label>
          <input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="Ex: Missa Dominical" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Descrição</label>
          <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Breve descrição do repertório" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Meta Title (SEO)</label>
          <input value={form.metaTitle} onChange={e => setForm({...form, metaTitle: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="Título para SEO" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Palavras-chave</label>
          <input value={form.palavrasChave} onChange={e => setForm({...form, palavrasChave: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="palavra1, palavra2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Meta Description (SEO)</label>
          <textarea value={form.metaDescription} onChange={e => setForm({...form, metaDescription: e.target.value})} rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Descrição para mecanismos de busca" />
        </div>
      </div>

      {/* Músicas */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-white mb-3">Músicas ({musicas.length})</h4>
        <div className="space-y-2 mb-4">
          {musicas.map((m, i) => (
            <div key={i} className="rounded-xl bg-white/3 border border-white/5 overflow-hidden">
              {editandoMusica === i && musicaEditada ? (
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select value={musicaEditada.momentoId} onChange={e => setMusicaEditada({...musicaEditada, momentoId: parseInt(e.target.value)})}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="">Selecione</option>
              {momentosPorTipo?.map(mo => <option key={mo.id} value={mo.id} style={{backgroundColor: '#1e293b', color: '#fff'}}>{mo.nome}</option>)}
            </select>
                    <input value={musicaEditada.titulo} onChange={e => setMusicaEditada({...musicaEditada, titulo: e.target.value})}
                      placeholder="Título *" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none col-span-1 sm:col-span-2" />
                    <input value={musicaEditada.artista || ""} onChange={e => setMusicaEditada({...musicaEditada, artista: e.target.value})}
                      placeholder="Artista" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
                    <input value={musicaEditada.tom || ""} onChange={e => setMusicaEditada({...musicaEditada, tom: e.target.value})}
                      placeholder="Tom (ex: Dó)" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
                    <input value={musicaEditada.youtube || ""} onChange={e => setMusicaEditada({...musicaEditada, youtube: e.target.value})}
                      placeholder="Link YouTube" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
                    <input value={musicaEditada.cifra || ""} onChange={e => setMusicaEditada({...musicaEditada, cifra: e.target.value})}
                      placeholder="Link Cifra" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
                    <input value={musicaEditada.letra || ""} onChange={e => setMusicaEditada({...musicaEditada, letra: e.target.value})}
                      placeholder="Link Letra" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditandoMusica(null); setMusicaEditada(null); }} className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
                    <button onClick={salvarEdicaoMusica} className="px-3 py-1.5 rounded-lg text-xs text-white bg-purple-600/40 hover:bg-purple-600/60 transition-colors flex items-center gap-1"><Save className="w-3 h-3" />Salvar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 shrink-0">{m.momento?.nome || 'Sem momento'}</span>
                  <span className="text-sm text-white flex-1 truncate">{m.titulo}</span>
                  {m.artista && <span className="text-xs text-white/40 truncate hidden sm:block">{m.artista}</span>}
                  <button onClick={() => iniciarEdicaoMusica(i)} className="p-1 rounded text-purple-400 hover:bg-purple-600/10 transition-colors shrink-0" title="Editar música">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setMusicas(musicas.filter((_,j) => j !== i))} className="p-1 rounded text-red-400 hover:bg-red-600/10 transition-colors shrink-0" title="Remover música">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Adicionar nova música */}
        <div className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select value={novaMusica.momentoId} onChange={e => setNovaMusica({...novaMusica, momentoId: parseInt(e.target.value)})}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="">Selecione o momento</option>
              {momentosPorTipo?.map(mo => <option key={mo.id} value={mo.id} style={{backgroundColor: '#1e293b', color: '#fff'}}>{mo.nome}</option>)}
            </select>
            <input value={novaMusica.titulo} onChange={e => setNovaMusica({...novaMusica, titulo: e.target.value})}
              placeholder="Título *" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none col-span-1 sm:col-span-2" />
            <input value={novaMusica.artista} onChange={e => setNovaMusica({...novaMusica, artista: e.target.value})}
              placeholder="Artista" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            <input value={novaMusica.tom} onChange={e => setNovaMusica({...novaMusica, tom: e.target.value})}
              placeholder="Tom (ex: Dó)" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            <input value={novaMusica.youtube} onChange={e => setNovaMusica({...novaMusica, youtube: e.target.value})}
              placeholder="Link YouTube" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            <input value={novaMusica.cifra} onChange={e => setNovaMusica({...novaMusica, cifra: e.target.value})}
              placeholder="Link Cifra" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            <input value={novaMusica.letra} onChange={e => setNovaMusica({...novaMusica, letra: e.target.value})}
              placeholder="Link Letra" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
          </div>
          <button onClick={() => {
            if (novaMusica.titulo && novaMusica.momentoId) {
              setMusicas([...musicas, novaMusica]);
              setNovaMusica({ titulo: "", artista: "", tom: "", momentoId: momentosPorTipo?.[0]?.id || 1, youtube: "", cifra: "", letra: "" });
            }
          }} className="w-full px-3 py-2 rounded-lg text-sm text-white bg-purple-600/40 hover:bg-purple-600/60 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />Adicionar
          </button>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
        <button onClick={salvar} disabled={criar.isPending || editar.isPending} className="px-4 py-2 rounded-xl text-sm text-white bg-purple-600/40 hover:bg-purple-600/60 transition-colors disabled:opacity-50 flex items-center gap-2">
          <Save className="w-4 h-4" />{inicial ? "Salvar Alterações" : "Criar Repertório"}
        </button>
      </div>
    </div>
  );
}

function BlogAdmin() {
  const utils = trpc.useUtils();
  const { data: lista, isLoading } = trpc.admin.listarArtigos.useQuery();
  const deletar = trpc.admin.deletarArtigo.useMutation({ onSuccess: () => utils.admin.listarArtigos.invalidate() });
  const [editando, setEditando] = useState<any>(null);
  const [criando, setCriando] = useState(false);

  if (isLoading) return <div className="text-white/50">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Artigos ({lista?.length || 0})</h2>
        <button onClick={() => setCriando(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
          <Plus className="w-4 h-4" />Novo Artigo
        </button>
      </div>

      {(criando || editando) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="w-full max-w-2xl">
            <ArtigoForm
              inicial={editando}
              onClose={() => { setCriando(false); setEditando(null); }}
              onSaved={() => { setCriando(false); setEditando(null); utils.admin.listarArtigos.invalidate(); }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {lista?.map(a => (
          <div key={a.id} className="card-glass rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300">{a.categoria}</span>
                <h3 className="text-sm font-semibold text-white truncate">{a.titulo}</h3>
              </div>
              <p className="text-xs text-white/40 truncate">{a.resumo || a.conteudo?.substring(0, 50)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditando(a)} className="p-2 rounded-lg text-purple-400 hover:bg-purple-600/10 transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => deletar.mutate({ id: a.id })} className="p-2 rounded-lg text-red-400 hover:bg-red-600/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtigoForm({ inicial, onClose, onSaved }: { inicial?: any; onClose: () => void; onSaved: () => void }) {
  const criar = trpc.admin.criarArtigo.useMutation({ onSuccess: () => onSaved() });
  const editar = trpc.admin.editarArtigo.useMutation({ onSuccess: () => onSaved() });
  const [form, setForm] = useState({
    titulo: inicial?.titulo || "",
    descricao: inicial?.descricao || "",
    conteudo: inicial?.conteudo || "",
    categoria: inicial?.categoria || "",
    tags: Array.isArray(inicial?.tags) ? inicial.tags.join(", ") : (typeof inicial?.tags === "string" ? inicial.tags : ""),
    imagemCapa: inicial?.imagemCapa || "",
  });
  const [uploadando, setUploadando] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadando(true);
    try {
      const formData = new FormData();
      formData.append("imagem", file);
      const response = await fetch("/api/upload/imagem", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setForm({ ...form, imagemCapa: data.url });
      } else {
        alert("Erro ao fazer upload: " + (data.error || "Desconhecido"));
      }
    } catch (err: any) {
      alert("Erro ao fazer upload: " + err.message);
    } finally {
      setUploadando(false);
    }
  };

  const salvar = async () => {
    if (!form.titulo) return alert("Título é obrigatório");
    if (!form.conteudo) return alert("Conteúdo é obrigatório");
    
    const tags = form.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    
    if (inicial) {
      await editar.mutateAsync({ id: inicial.id, ...form, tags });
    } else {
      await criar.mutateAsync({ ...form, tags });
    }
  };

  return (
    <div className="card-glass rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{inicial ? "Editar Artigo" : "Novo Artigo"}</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div>
        <label className="text-xs font-semibold text-white/60 mb-1 block">Título *</label>
        <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
          placeholder="Título do artigo" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-white/60 mb-1 block">Descrição</label>
        <input value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
          placeholder="Breve descrição" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-white/60 mb-1 block">Categoria</label>
        <input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
          placeholder="Ex: Música, Liturgia" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-white/60 mb-1 block">Tags</label>
        <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
          placeholder="tag1, tag2, tag3" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-white/60 mb-1 block">Imagem de Capa</label>
        <div className="flex gap-2 items-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadando}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm file:mr-2 file:px-2 file:py-1 file:rounded file:bg-purple-600/40 file:text-white file:cursor-pointer file:border-0 focus:outline-none" />
          {uploadando && <span className="text-xs text-white/50">Enviando...</span>}
        </div>
        {form.imagemCapa && (
          <div className="mt-2 relative">
            <img src={form.imagemCapa} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            <button type="button" onClick={() => setForm({...form, imagemCapa: ""})} className="absolute top-1 right-1 p-1 bg-red-600/80 rounded text-white text-xs hover:bg-red-700">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-white/60 mb-1 block">Conteúdo *</label>
        <textarea value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})}
          placeholder="Conteúdo do artigo (Markdown suportado)" rows={8} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none resize-none" />
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
        <button onClick={salvar} disabled={criar.isPending || editar.isPending} className="px-4 py-2 rounded-xl text-sm text-white bg-purple-600/40 hover:bg-purple-600/60 transition-colors disabled:opacity-50 flex items-center gap-2">
          <Save className="w-4 h-4" />{inicial ? "Salvar Alterações" : "Criar Artigo"}
        </button>
      </div>
    </div>
  );
}
