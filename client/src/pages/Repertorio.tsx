import { Link, useParams } from "wouter";
import { ArrowLeft, Music, BookOpen, Copy, Share2, FileDown, Youtube, Guitar, FileText, Check, Heart } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useCallback } from "react";

const MOMENTOS_LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  ATO_PENITENCIAL: "Ato Penitencial",
  GLORIA: "Glória",
  SALMO: "Salmo Responsorial",
  ACLAMACAO: "Aclamação ao Evangelho",
  OFERTORIO: "Ofertório",
  SANTO: "Santo",
  COMUNHAO: "Comunhão",
  FINAL: "Final",
  OUTROS: "Outros Momentos",
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
  ADVENTO: "Advento",
  NATAL: "Natal",
  QUARESMA: "Quaresma",
  PASCOA: "Páscoa",
  TEMPO_COMUM: "Tempo Comum",
  CELEBRACOES: "Celebrações",
};

export default function Repertorio() {
  const { slug } = useParams<{ slug: string }>();
  const { data: r, isLoading } = trpc.repertorios.buscarPorSlug.useQuery({ slug: slug || "" }, { enabled: !!slug });
  const [copiado, setCopiado] = useState(false);
  const [exportando, setExportando] = useState(false);
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: favData } = trpc.usuario.verificarFavorito.useQuery(
    { repertorioId: r?.id || 0 },
    { enabled: isAuthenticated && !!r?.id }
  );
  const toggleFav = trpc.usuario.toggleFavorito.useMutation({
    onSuccess: () => utils.usuario.verificarFavorito.invalidate(),
  });
  const isFavorito = favData?.favoritado ?? false;

  const gerarTextoRepertorio = useCallback(() => {
    if (!r) return "";
    let texto = `${r.titulo}\n`;
    texto += `Tempo Litúrgico: ${TEMPO_LABELS[r.tempoLiturgico] || r.tempoLiturgico}\n`;
    if (r.categoria) texto += `Categoria: ${r.categoria}\n`;
    texto += "\n";
    Object.entries(MOMENTOS_LABELS).forEach(([key, label]) => {
      const musicas = r.musicas?.filter((m: any) => m.momento === key) || [];
      if (musicas.length > 0) {
        texto += `── ${label} ──\n`;
        musicas.forEach((m: any) => {
          texto += `• ${m.titulo}`;
          if (m.artista) texto += ` (${m.artista})`;
          texto += "\n";
        });
        texto += "\n";
      }
    });
    texto += "Fonte: LouvaMais — louvamais-repertorios.manus.space";
    return texto;
  }, [r]);

  const copiarRepertorio = useCallback(async () => {
    const texto = gerarTextoRepertorio();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // fallback para navegadores antigos
      const el = document.createElement("textarea");
      el.value = texto;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }, [gerarTextoRepertorio]);

  const compartilhar = useCallback(async () => {
    const url = window.location.href;
    const titulo = r?.titulo || "Repertório Litúrgico";
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: `Confira este repertório: ${titulo}`, url });
      } catch { /* cancelado pelo usuário */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  }, [r]);

  const exportarPDF = useCallback(async () => {
    if (!r) return;
    setExportando(true);
    try {
      // Gera HTML para impressão/PDF
      const momentosHtml = Object.entries(MOMENTOS_LABELS).map(([key, label]) => {
        const musicas = r.musicas?.filter((m: any) => m.momento === key) || [];
        if (musicas.length === 0) return "";
        const musicasHtml = musicas.map((m: any) =>
          `<li style="margin-bottom:6px;"><strong>${m.titulo}</strong>${m.artista ? ` <span style="color:#666;font-size:13px;">(${m.artista})</span>` : ""}</li>`
        ).join("");
        return `<div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-bottom:12px;">${label}</h3>
          <ul style="list-style:none;padding:0;margin:0;">${musicasHtml}</ul>
        </div>`;
      }).join("");

      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
        <title>${r.titulo}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
          h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 8px; }
          .descricao { color: #444; font-size: 15px; margin-bottom: 28px; border-left: 3px solid #7c3aed; padding-left: 12px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px; text-align: center; }
          @media print { body { margin: 20px; } }
        </style>
      </head><body>
        <h1>${r.titulo}</h1>
        <p class="meta">${TEMPO_LABELS[r.tempoLiturgico] || r.tempoLiturgico}${r.categoria ? ` · ${r.categoria}` : ""}</p>
        ${r.descricao ? `<p class="descricao">${r.descricao}</p>` : ""}
        ${momentosHtml}
        <div class="footer">Gerado por LouvaMais — Repertórios Litúrgicos Católicos</div>
      </body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          win.print();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        };
      }
    } finally {
      setExportando(false);
    }
  }, [r]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/4" />
          <div className="h-12 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Repertório não encontrado</h1>
        <Link href="/repertorios" className="text-purple-400 hover:text-purple-300">← Voltar aos repertórios</Link>
      </div>
    );
  }

  const momentosComMusicas = Object.entries(MOMENTOS_LABELS).filter(([key]) => {
    const musicas = r.musicas?.filter((m: any) => m.momento === key) || [];
    return musicas.length > 0;
  });

  return (
    <>
      <SEO
        title={r.metaTitle || `${r.titulo} | LouvaMais`}
        description={r.metaDescription || r.descricao || `Repertório litúrgico para ${TEMPO_LABELS[r.tempoLiturgico] || r.tempoLiturgico} com músicas organizadas por momento da Missa.`}
        keywords={r.palavrasChave || `repertório ${r.tempoLiturgico?.toLowerCase()}, músicas para missa, liturgia católica`}
        ogType="article"
      />
      <div className="container py-12 md:py-16">
        {/* Breadcrumb */}
        <Link href="/repertorios" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Repertórios
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${TEMPO_COLORS[r.tempoLiturgico] || "bg-purple-600/20 text-purple-300 border-purple-500/30"}`}>
              {TEMPO_LABELS[r.tempoLiturgico] || r.tempoLiturgico}
            </span>
            {r.categoria && (
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 text-white/50 border border-white/10">
                {r.categoria}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{r.titulo}</h1>
          {r.descricao && <p className="text-lg text-white/60 max-w-2xl leading-relaxed">{r.descricao}</p>}
        </div>

        {/* Barra de ações */}
        <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-white/10">
          <button
            onClick={copiarRepertorio}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            {copiado ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copiado ? "Copiado!" : "Copiar repertório"}
          </button>
          <button
            onClick={compartilhar}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
          <button
            onClick={exportarPDF}
            disabled={exportando}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all duration-200 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            {exportando ? "Gerando..." : "Exportar PDF"}
          </button>
          {isAuthenticated && r?.id && (
            <button
              onClick={() => toggleFav.mutate({ repertorioId: r.id })}
              disabled={toggleFav.isPending}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 disabled:opacity-50 ${
                isFavorito
                  ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorito ? "fill-current" : ""}`} />
              {isFavorito ? "Favoritado" : "Favoritar"}
            </button>
          )}
        </div>

        {/* Músicas por Momento */}
        {momentosComMusicas.length > 0 ? (
          <div className="space-y-6">
            {momentosComMusicas.map(([key, label]) => {
              const musicas = r.musicas?.filter((m: any) => m.momento === key) || [];
              return (
                <div key={key} className="card-glass rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-purple-600/20">
                      <Music className="w-4 h-4 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">{label}</h2>
                    <span className="text-xs text-white/30 ml-auto">{musicas.length} música{musicas.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-2">
                    {musicas.map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{m.titulo}</p>
                          {m.artista && <p className="text-sm text-white/40 truncate">{m.artista}</p>}
                        </div>
                        {/* Ícones de links */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {m.youtube && (
                            <a href={m.youtube} target="_blank" rel="noopener noreferrer"
                              title="Ouvir no YouTube"
                              className="p-2 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/30 transition-colors">
                              <Youtube className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.cifra && (
                            <a href={m.cifra} target="_blank" rel="noopener noreferrer"
                              title="Ver cifra"
                              className="p-2 rounded-lg bg-purple-600/15 text-purple-400 hover:bg-purple-600/30 transition-colors">
                              <Guitar className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.letra && (
                            <a href={m.letra} target="_blank" rel="noopener noreferrer"
                              title="Ver letra"
                              className="p-2 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/30 transition-colors">
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-glass rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Este repertório ainda não possui músicas cadastradas.</p>
          </div>
        )}

        {/* CTA inferior */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/repertorios" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Ver outros repertórios
          </Link>
          <div className="flex gap-3">
            <button onClick={copiarRepertorio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
              {copiado ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copiado ? "Copiado!" : "Copiar"}
            </button>
            <button onClick={exportarPDF} disabled={exportando}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all disabled:opacity-50">
              <FileDown className="w-4 h-4" />
              {exportando ? "Gerando..." : "Exportar PDF"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
