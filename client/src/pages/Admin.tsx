import { useState, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Trash2, Edit, Music, BookOpen, Save, X, ExternalLink, Eye, Upload, ImageIcon } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type Tab = "repertorios" | "blog";

const TEMPOS = ["ADVENTO","NATAL","QUARESMA","PASCOA","TEMPO_COMUM","CELEBRACOES","GERAL"];
const MOMENTOS = ["ENTRADA","ATO_PENITENCIAL","GLORIA","SALMO","OFERTORIO","COMUNHAO","FINAL","OUTROS"];
const MOMENTOS_LABELS: Record<string,string> = {
  ENTRADA:"Entrada",ATO_PENITENCIAL:"Ato Penitencial",GLORIA:"Glória",SALMO:"Salmo",
  OFERTORIO:"Ofertório",COMUNHAO:"Comunhão",FINAL:"Final",OUTROS:"Outros"
};

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
                {r.categoria && <span className="text-xs text-white/30">{r.categoria}</span>}
              </div>
              <p className="font-medium text-white truncate">{r.titulo}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/repertorios/${r.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors" title="Ver no site">
                <Eye className="w-4 h-4" />
              </a>
              <button onClick={() => setEditando(r)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => { if(confirm("Deletar este repertório?")) deletar.mutate({ id: r.id }); }}
                className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepertorioForm({ inicial, onClose, onSaved }: { inicial?: any; onClose: () => void; onSaved: () => void }) {
  const criar = trpc.admin.criarRepertorio.useMutation({ onSuccess: onSaved });
  const editar = trpc.admin.editarRepertorio.useMutation({ onSuccess: onSaved });

  const [form, setForm] = useState({
    titulo: inicial?.titulo || "",
    tempoLiturgico: inicial?.tempoLiturgico || "GERAL",
    categoria: inicial?.categoria || "",
    descricao: inicial?.descricao || "",
    metaTitle: inicial?.metaTitle || "",
    metaDescription: inicial?.metaDescription || "",
    palavrasChave: inicial?.palavrasChave || "",
  });

  const [musicas, setMusicas] = useState<any[]>(inicial?.musicas || []);
  const [novaMusica, setNovaMusica] = useState({ titulo: "", artista: "", tom: "", momento: "ENTRADA", youtube: "", cifra: "", letra: "" });

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
          <label className="block text-xs font-medium text-white/50 mb-1">Tempo Litúrgico *</label>
          <select value={form.tempoLiturgico} onChange={e => setForm({...form, tempoLiturgico: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
            {TEMPOS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
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
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 shrink-0">{MOMENTOS_LABELS[m.momento]}</span>
              <span className="text-sm text-white flex-1 truncate">{m.titulo}</span>
              {m.artista && <span className="text-xs text-white/40 truncate hidden sm:block">{m.artista}</span>}
              <button onClick={() => setMusicas(musicas.filter((_,j) => j !== i))} className="p-1 rounded text-red-400 hover:bg-red-600/10 transition-colors shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 rounded-xl bg-white/3 border border-white/5">
          <select value={novaMusica.momento} onChange={e => setNovaMusica({...novaMusica, momento: e.target.value})}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none">
            {MOMENTOS.map(m => <option key={m} value={m} className="bg-slate-900">{MOMENTOS_LABELS[m]}</option>)}
          </select>
          <input value={novaMusica.titulo} onChange={e => setNovaMusica({...novaMusica, titulo: e.target.value})}
            placeholder="Título da música *" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none col-span-1 sm:col-span-2" />
          <input value={novaMusica.artista} onChange={e => setNovaMusica({...novaMusica, artista: e.target.value})}
            placeholder="Artista" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
          <input value={novaMusica.youtube} onChange={e => setNovaMusica({...novaMusica, youtube: e.target.value})}
            placeholder="Link YouTube" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
          <input value={novaMusica.cifra} onChange={e => setNovaMusica({...novaMusica, cifra: e.target.value})}
            placeholder="Link Cifra" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
          <input value={novaMusica.letra} onChange={e => setNovaMusica({...novaMusica, letra: e.target.value})}
            placeholder="Link Letra" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
          <input value={novaMusica.tom} onChange={e => setNovaMusica({...novaMusica, tom: e.target.value})}
            placeholder="Tom (ex: Dó)" className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
          <button onClick={() => {
            if (!novaMusica.titulo.trim()) return;
            setMusicas([...musicas, {...novaMusica}]);
            setNovaMusica({ titulo: "", artista: "", tom: "", momento: "ENTRADA", youtube: "", cifra: "", letra: "" });
          }} className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />Adicionar
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
        <button onClick={salvar} disabled={criar.isPending || editar.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
          <Save className="w-4 h-4" />{criar.isPending || editar.isPending ? "Salvando..." : "Salvar"}
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
                {a.categoria && <span className="text-xs px-2 py-0.5 rounded-full bg-pink-600/20 text-pink-300">{a.categoria}</span>}
                <span className="text-xs text-white/30">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <p className="font-medium text-white truncate">{a.titulo}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors" title="Ver no site">
                <Eye className="w-4 h-4" />
              </a>
              <button onClick={() => setEditando(a)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => { if(confirm("Deletar este artigo?")) deletar.mutate({ id: a.id }); }}
                className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtigoForm({ inicial, onClose, onSaved }: { inicial?: any; onClose: () => void; onSaved: () => void }) {
  const criar = trpc.admin.criarArtigo.useMutation({ onSuccess: onSaved });
  const editar = trpc.admin.editarArtigo.useMutation({ onSuccess: onSaved });

  // Normaliza tags independente de vir como array, string JSON ou string CSV do banco
  const parseTags = (raw: any): string => {
    if (!raw) return "";
    if (Array.isArray(raw)) return raw.join(", ");
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch {}
      return raw; // já é string CSV ou texto simples
    }
    return String(raw);
  };

  const [form, setForm] = useState({
    titulo: inicial?.titulo ?? "",
    resumo: inicial?.resumo ?? "",
    conteudo: inicial?.conteudo ?? "",
    categoria: inicial?.categoria ?? "",
    imagemCapa: inicial?.imagemCapa ?? "",
    tags: parseTags(inicial?.tags),
    metaTitle: inicial?.metaTitle ?? "",
    metaDescription: inicial?.metaDescription ?? "",
    palavrasChave: inicial?.palavrasChave ?? "",
  });

  const [uploadando, setUploadando] = useState(false);
  const [erroUpload, setErroUpload] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErroUpload("Apenas imagens são permitidas (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErroUpload("A imagem deve ter no máximo 5 MB");
      return;
    }
    setErroUpload("");
    setUploadando(true);
    try {
      const formData = new FormData();
      formData.append("imagem", file);
      const res = await fetch("/api/upload/imagem", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Falha no upload");
      const { url } = await res.json();
      setForm(f => ({ ...f, imagemCapa: url }));
    } catch (err) {
      setErroUpload("Erro ao fazer upload. Tente novamente.");
    } finally {
      setUploadando(false);
    }
  };

  const salvar = () => {
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    };
    if (inicial) editar.mutate({ id: inicial.id, ...payload });
    else criar.mutate(payload);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{inicial ? "Editar Artigo" : "Novo Artigo"}</h3>
        <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Título *</label>
          <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="Título do artigo" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Categoria</label>
          <input value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="Ex: Liturgia" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Tags (separadas por vírgula)</label>
          <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" placeholder="advento, música sacra" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Imagem de Capa</label>
          <div className="space-y-3">
            {/* Preview da imagem atual */}
            {form.imagemCapa && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <img src={form.imagemCapa} alt="Capa" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imagemCapa: "" }))}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600/80 transition-colors"
                  title="Remover imagem"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Área de upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all cursor-pointer"
            >
              {uploadando ? (
                <>
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-white/50">Enviando imagem...</span>
                </>
              ) : (
                <>
                  {form.imagemCapa ? (
                    <><ImageIcon className="w-5 h-5 text-purple-400" /><span className="text-sm text-purple-300">Clique para trocar a imagem</span></>
                  ) : (
                    <><Upload className="w-5 h-5 text-white/40" /><span className="text-sm text-white/50">Clique para enviar uma imagem</span><span className="text-xs text-white/30">JPG, PNG ou WebP · máx. 5 MB</span></>
                  )}
                </>
              )}
            </div>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagemUpload}
            />

            {/* Erro de upload */}
            {erroUpload && <p className="text-xs text-red-400">{erroUpload}</p>}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Resumo</label>
          <textarea value={form.resumo} onChange={e => setForm({...form, resumo: e.target.value})} rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Breve resumo do artigo" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-white/50 mb-1">Conteúdo (HTML) *</label>
          <textarea value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})} rows={10}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-y font-mono text-sm" placeholder="<p>Conteúdo do artigo em HTML...</p>" />
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

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">Cancelar</button>
        <button onClick={salvar} disabled={criar.isPending || editar.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
          <Save className="w-4 h-4" />{criar.isPending || editar.isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
