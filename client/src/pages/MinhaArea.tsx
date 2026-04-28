import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Music, Plus, Trash2, Edit3, Share2, LogOut, User, ArrowLeft, ExternalLink, Youtube, Guitar, BookOpen, Check, X, FileText, Pencil, Save, FileDown } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const MOMENTO_LABELS: Record<string, string> = {
  ENTRADA: "Entrada", ATO_PENITENCIAL: "Ato Penitencial", GLORIA: "Glória",
  SALMO: "Salmo", ACLAMACAO: "Aclamação", OFERTORIO: "Ofertório",
  SANTO: "Santo", COMUNHAO: "Comunhão", FINAL: "Final", OUTROS: "Outros",
};

const TEMPO_COLORS: Record<string, string> = {
  ADVENTO: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  NATAL: "bg-green-600/20 text-green-300 border-green-500/30",
  QUARESMA: "bg-stone-600/20 text-stone-300 border-stone-500/30",
  PASCOA: "bg-amber-600/20 text-amber-300 border-amber-500/30",
  TEMPO_COMUM: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
  CELEBRACOES: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
};

const TEMPO_LABELS: Record<string, string> = {
  ADVENTO: "Advento", NATAL: "Natal", QUARESMA: "Quaresma",
  PASCOA: "Páscoa", TEMPO_COMUM: "Tempo Comum", CELEBRACOES: "Celebrações",
};

type Tab = "favoritos" | "musicas-favoritas" | "meus-repertorios";

export default function MinhaArea() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("favoritos");
  const [criandoRepertorio, setCriandoRepertorio] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [repertorioAberto, setRepertorioAberto] = useState<number | null>(null);
  const [adicionandoMusica, setAdicionandoMusica] = useState(false);
  const [novaMusica, setNovaMusica] = useState({ titulo: "", artista: "", tom: "", momento: "OUTROS", youtube: "", cifra: "", letra: "" });
  const [editandoMusicaId, setEditandoMusicaId] = useState<number | null>(null);
  const [musicaEditForm, setMusicaEditForm] = useState<any>(null);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: favoritos, isLoading: loadingFavs } = trpc.usuario.listarFavoritos.useQuery(undefined, { enabled: isAuthenticated });
  const { data: meusRepertorios, isLoading: loadingReps } = trpc.usuario.listarMeusRepertorios.useQuery(undefined, { enabled: isAuthenticated });
  const { data: repertorioDetalhes } = trpc.usuario.buscarMeuRepertorio.useQuery({ id: repertorioAberto! }, { enabled: !!repertorioAberto });

  const criarRep = trpc.usuario.criarMeuRepertorio.useMutation({
    onSuccess: () => { utils.usuario.listarMeusRepertorios.invalidate(); setCriandoRepertorio(false); setNovoTitulo(""); setNovaDescricao(""); toast({ title: "Repertório criado!" }); },
  });
  const excluirRep = trpc.usuario.excluirMeuRepertorio.useMutation({
    onSuccess: () => { utils.usuario.listarMeusRepertorios.invalidate(); if (repertorioAberto) setRepertorioAberto(null); toast({ title: "Repertório excluído" }); },
  });
  const { data: musicasFavoritas, isLoading: loadingMusicasFav, refetch: refetchMusicasFav } = trpc.usuario.listarMusicasFavoritas.useQuery(undefined, { enabled: isAuthenticated });
  const toggleMusicaFav = trpc.usuario.toggleMusicaFavorita.useMutation({
    onSuccess: () => refetchMusicasFav(),
  });
  const removeFav = trpc.usuario.toggleFavorito.useMutation({
    onSuccess: () => utils.usuario.listarFavoritos.invalidate(),
  });
  const addMusica = trpc.usuario.adicionarMusica.useMutation({
    onSuccess: () => { utils.usuario.buscarMeuRepertorio.invalidate(); setAdicionandoMusica(false); setNovaMusica({ titulo: "", artista: "", tom: "", momento: "OUTROS", youtube: "", cifra: "", letra: "" }); toast({ title: "Música adicionada!" }); },
  });
  const removeMusica = trpc.usuario.removerMusica.useMutation({
    onSuccess: () => utils.usuario.buscarMeuRepertorio.invalidate(),
  });
  const editarMusicaUser = trpc.usuario.editarMusica.useMutation({
    onSuccess: () => { utils.usuario.buscarMeuRepertorio.invalidate(); setEditandoMusicaId(null); setMusicaEditForm(null); toast({ title: "Música atualizada!" }); },
  });
  const exportarPDF = trpc.usuario.exportarPDF.useMutation({
    onSuccess: (data) => {
      // Converter base64 para Blob e disparar download
      const bytes = Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF gerado!", description: "O download iniciou automaticamente." });
    },
    onError: () => toast({ title: "Erro ao gerar PDF", description: "Tente novamente." }),
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <SEO title="Minha Área | LouvaMais" description="Acesse sua área pessoal no LouvaMais para gerenciar favoritos e repertórios." />
        <div className="p-4 rounded-2xl bg-purple-600/20 border border-purple-500/30 w-fit mx-auto mb-6">
          <User className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Minha Área</h1>
        <p className="text-white/50 mb-8">Faça login para acessar seus favoritos e criar repertórios personalizados.</p>
        <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all">
          Entrar com Manus
        </a>
      </div>
    );
  }

  // Visão do repertório aberto
  if (repertorioAberto && repertorioDetalhes) {
    return (
      <div className="container py-8 max-w-3xl mx-auto">
        <SEO title={`${repertorioDetalhes.titulo} | Minha Área`} description="Repertório personalizado no LouvaMais." />
        <button onClick={() => setRepertorioAberto(null)} className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">{repertorioDetalhes.titulo}</h1>
            {repertorioDetalhes.descricao && <p className="text-white/50 mt-1 text-sm">{repertorioDetalhes.descricao}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportarPDF.mutate({ id: repertorioAberto })}
              disabled={exportarPDF.isPending}
              size="sm"
              className="bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/40 hover:text-white transition-all text-xs gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              {exportarPDF.isPending ? "Gerando..." : "Exportar PDF"}
            </Button>
            <button onClick={() => excluirRep.mutate({ id: repertorioAberto })} className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Músicas */}
        <div className="space-y-3 mb-6">
          {repertorioDetalhes.musicas?.length === 0 && (
            <div className="text-center py-10 text-white/30 text-sm">Nenhuma música ainda. Adicione a primeira!</div>
          )}
          {(repertorioDetalhes.musicas || []).map((m) => (
            <div key={m.id} className="card-glass rounded-xl overflow-hidden">
              {editandoMusicaId === m.id && musicaEditForm ? (
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Título *" value={musicaEditForm.titulo} onChange={e => setMusicaEditForm((p: any) => ({...p, titulo: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 col-span-2" />
                    <Input placeholder="Artista" value={musicaEditForm.artista || ""} onChange={e => setMusicaEditForm((p: any) => ({...p, artista: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                    <Input placeholder="Tom (ex: Dó)" value={musicaEditForm.tom || ""} onChange={e => setMusicaEditForm((p: any) => ({...p, tom: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  </div>
                  <Select value={musicaEditForm.momento} onValueChange={v => setMusicaEditForm((p: any) => ({...p, momento: v}))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(MOMENTO_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Link YouTube" value={musicaEditForm.youtube || ""} onChange={e => setMusicaEditForm((p: any) => ({...p, youtube: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <Input placeholder="Link Cifra" value={musicaEditForm.cifra || ""} onChange={e => setMusicaEditForm((p: any) => ({...p, cifra: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <Input placeholder="Link Letra" value={musicaEditForm.letra || ""} onChange={e => setMusicaEditForm((p: any) => ({...p, letra: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <div className="flex gap-2 pt-1">
                    <Button onClick={() => editarMusicaUser.mutate({ id: m.id, repertorioId: repertorioAberto!, ...musicaEditForm })} disabled={!musicaEditForm.titulo || editarMusicaUser.isPending} className="bg-purple-600 hover:bg-purple-500 text-white flex-1 text-xs">
                      <Save className="w-3 h-3 mr-1" />{editarMusicaUser.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button variant="outline" onClick={() => { setEditandoMusicaId(null); setMusicaEditForm(null); }} className="border-white/10 text-white/60 text-xs">Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30">{MOMENTO_LABELS[m.momento] || m.momento}</span>
                      {m.tom && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">{m.tom}</span>}
                    </div>
                    <p className="font-semibold text-white text-sm">{m.titulo}</p>
                    {m.artista && <p className="text-xs text-white/40">{m.artista}</p>}
                    <div className="flex gap-2 mt-2">
                      {m.youtube && <a href={m.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"><Youtube className="w-3 h-3" /> YouTube</a>}
                      {m.cifra && <a href={m.cifra} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Guitar className="w-3 h-3" /> Cifra</a>}
                      {m.letra && <a href={m.letra} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300"><BookOpen className="w-3 h-3" /> Letra</a>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditandoMusicaId(m.id); setMusicaEditForm({ titulo: m.titulo, artista: m.artista || "", tom: m.tom || "", momento: m.momento, youtube: m.youtube || "", cifra: m.cifra || "", letra: m.letra || "" }); }} className="p-1.5 rounded-lg text-purple-400/60 hover:text-purple-400 hover:bg-purple-400/10 transition-all" title="Editar música">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeMusica.mutate({ id: m.id, repertorioId: repertorioAberto })} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Remover música">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Adicionar música */}
        {adicionandoMusica ? (
          <div className="card-glass p-5 rounded-2xl space-y-3">
            <h3 className="font-bold text-white text-sm mb-3">Nova música</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Título da música *" value={novaMusica.titulo} onChange={e => setNovaMusica(p => ({...p, titulo: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 col-span-2" />
              <Input placeholder="Artista" value={novaMusica.artista} onChange={e => setNovaMusica(p => ({...p, artista: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              <Input placeholder="Tom (ex: Dó, Ré)" value={novaMusica.tom} onChange={e => setNovaMusica(p => ({...p, tom: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            </div>
            <Select value={novaMusica.momento} onValueChange={v => setNovaMusica(p => ({...p, momento: v}))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Momento da missa" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOMENTO_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Link YouTube" value={novaMusica.youtube} onChange={e => setNovaMusica(p => ({...p, youtube: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Input placeholder="Link Cifra (cifraclub.com.br)" value={novaMusica.cifra} onChange={e => setNovaMusica(p => ({...p, cifra: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Input placeholder="Link Letra (letras.mus.br)" value={novaMusica.letra} onChange={e => setNovaMusica(p => ({...p, letra: e.target.value}))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <div className="flex gap-2 pt-1">
              <Button onClick={() => addMusica.mutate({ ...novaMusica, momento: novaMusica.momento as any, repertorioId: repertorioAberto })} disabled={!novaMusica.titulo || addMusica.isPending} className="bg-purple-600 hover:bg-purple-500 text-white flex-1">
                {addMusica.isPending ? "Salvando..." : "Adicionar"}
              </Button>
              <Button variant="outline" onClick={() => setAdicionandoMusica(false)} className="border-white/10 text-white/60">Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setAdicionandoMusica(true)} className="w-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <Plus className="w-4 h-4 mr-2" /> Adicionar música
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <SEO title="Minha Área | LouvaMais" description="Gerencie seus repertórios favoritos e crie repertórios personalizados no LouvaMais." />
      <div className="container py-8 md:py-12 max-w-4xl mx-auto">
        {/* Header do usuário */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{user?.name || "Usuário"}</h1>
              <p className="text-sm text-white/40">{user?.email || ""}</p>
            </div>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-0">
          {([["favoritos", Heart, "Favoritos"], ["musicas-favoritas", FileText, "Minhas Músicas"], ["meus-repertorios", Music, "Meus Repertórios"]] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => setTab(id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${tab === id ? "border-purple-500 text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Favoritos */}
        {tab === "favoritos" && (
          <div>
            {loadingFavs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : !favoritos?.length ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 mb-2">Nenhum favorito ainda</p>
                <p className="text-sm text-white/20">Explore os repertórios e clique no coração para salvar.</p>
                <Link href="/repertorios" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-all">
                  Ver repertórios
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoritos.map(r => (
                  <div key={r.id} className="card-glass p-5 rounded-2xl group">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${TEMPO_COLORS[r.tempoLiturgico] || "bg-purple-600/20 text-purple-300 border-purple-500/30"}`}>
                        {TEMPO_LABELS[r.tempoLiturgico] || r.tempoLiturgico}
                      </span>
                      <button onClick={() => removeFav.mutate({ repertorioId: r.id })} className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <h3 className="font-bold text-white mb-1 line-clamp-2">{r.titulo}</h3>
                    {r.descricao && <p className="text-xs text-white/40 line-clamp-2 mb-3">{r.descricao}</p>}
                    <Link href={`/repertorios/${r.slug}`} className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                      Ver repertório <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Minhas Músicas */}
        {tab === "musicas-favoritas" && (
          <div>
            {loadingMusicasFav ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : !musicasFavoritas?.length ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 mb-2">Nenhuma música favoritada</p>
                <p className="text-sm text-white/20">Acesse um repertório e clique no coração ao lado de uma música para salvá-la aqui.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {musicasFavoritas.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{m.titulo}</p>
                      {m.artista && <p className="text-xs text-white/40 truncate">{m.artista}</p>}
                      {m.tom && <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/30 mt-0.5 inline-block">{m.tom}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.youtube && (
                        <a href={m.youtube} target="_blank" rel="noopener noreferrer" title="Ouvir no YouTube"
                          className="p-2 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/30 transition-colors">
                          <Youtube className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {m.cifra && (
                        <a href={m.cifra} target="_blank" rel="noopener noreferrer" title="Ver cifra"
                          className="p-2 rounded-lg bg-purple-600/15 text-purple-400 hover:bg-purple-600/30 transition-colors">
                          <Guitar className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {m.letra && (
                        <a href={m.letra} target="_blank" rel="noopener noreferrer" title="Ver letra"
                          className="p-2 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/30 transition-colors">
                          <BookOpen className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => toggleMusicaFav.mutate({ musicaId: m.id })}
                        className="p-2 rounded-lg bg-pink-600/20 text-pink-400 hover:bg-pink-600/30 transition-colors" title="Remover dos favoritos">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Meus Repertórios */}
        {tab === "meus-repertorios" && (
          <div>
            {/* Criar novo */}
            {criandoRepertorio ? (
              <div className="card-glass p-5 rounded-2xl mb-6 space-y-3">
                <h3 className="font-bold text-white text-sm">Novo repertório</h3>
                <Input placeholder="Nome do repertório *" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                <Textarea placeholder="Descrição (opcional)" value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)} rows={2} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none" />
                <div className="flex gap-2">
                  <Button onClick={() => criarRep.mutate({ titulo: novoTitulo, descricao: novaDescricao || undefined })} disabled={!novoTitulo || criarRep.isPending} className="bg-purple-600 hover:bg-purple-500 text-white flex-1">
                    {criarRep.isPending ? "Criando..." : "Criar"}
                  </Button>
                  <Button variant="outline" onClick={() => setCriandoRepertorio(false)} className="border-white/10 text-white/60">Cancelar</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCriandoRepertorio(true)} className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all text-sm font-medium">
                <Plus className="w-4 h-4" /> Criar novo repertório
              </button>
            )}

            {loadingReps ? (
              <div className="space-y-3">
                {[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : !meusRepertorios?.length ? (
              <div className="text-center py-16">
                <Music className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 mb-2">Nenhum repertório criado</p>
                <p className="text-sm text-white/20">Crie seu primeiro repertório personalizado para sua equipe de música.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meusRepertorios.map(r => (
                  <div key={r.id} className="card-glass p-5 rounded-2xl flex items-center justify-between gap-4 group hover-lift cursor-pointer" onClick={() => setRepertorioAberto(r.id)}>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">{r.titulo}</h3>
                      {r.descricao && <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{r.descricao}</p>}
                      <p className="text-xs text-white/20 mt-1">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.compartilhado && <Share2 className="w-4 h-4 text-purple-400" />}
                      <button
                        onClick={e => { e.stopPropagation(); exportarPDF.mutate({ id: r.id }); }}
                        disabled={exportarPDF.isPending}
                        className="p-2 rounded-lg text-purple-400/50 hover:text-purple-400 hover:bg-purple-400/10 transition-all"
                        title="Exportar PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); excluirRep.mutate({ id: r.id }); }} className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
