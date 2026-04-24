import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  BarChart2,
  Eye,
  MousePointerClick,
  Activity,
  ArrowLeft,
  Music,
  BookOpen,
  Youtube,
  Guitar,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";

type Periodo = "7d" | "30d" | "90d" | "total";

const PERIODO_LABELS: Record<Periodo, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  total: "Todo o período",
};

const ACAO_LABELS: Record<string, string> = {
  salvar_repertorio: "Salvar repertório",
  exportar_pdf: "Exportar PDF",
  favoritar: "Favoritar",
  copiar_repertorio: "Copiar repertório",
  compartilhar: "Compartilhar",
};

const LINK_ICONS: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-3.5 h-3.5 text-red-400" />,
  cifra: <Guitar className="w-3.5 h-3.5 text-purple-400" />,
  letra: <FileText className="w-3.5 h-3.5 text-blue-400" />,
};

export default function AdminAnalytics() {
  const [periodo, setPeriodo] = useState<Periodo>("30d");

  const { data, isLoading, error } = trpc.analytics.dashboard.useQuery({ periodo });

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">Acesso restrito a administradores.</p>
          <Link href="/admin" className="text-purple-400 hover:text-purple-300 text-sm underline">
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <BarChart2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Analytics</h1>
                <p className="text-xs text-white/40">Dados de uso do LouvaMais</p>
              </div>
            </div>
          </div>

          {/* Seletor de período */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
            {(["7d", "30d", "90d", "total"] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  periodo === p
                    ? "bg-purple-600 text-white shadow"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {p === "total" ? "Total" : p === "7d" ? "7d" : p === "30d" ? "30d" : "90d"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Cards de totais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-600/20">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{data?.totais.views.toLocaleString("pt-BR")}</p>
                  <p className="text-sm text-white/50">Visualizações</p>
                  <p className="text-xs text-white/30">{PERIODO_LABELS[periodo]}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-600/20">
                  <MousePointerClick className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{data?.totais.clicks.toLocaleString("pt-BR")}</p>
                  <p className="text-sm text-white/50">Cliques em músicas</p>
                  <p className="text-xs text-white/30">{PERIODO_LABELS[periodo]}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-600/20">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{data?.totais.acoes.toLocaleString("pt-BR")}</p>
                  <p className="text-sm text-white/50">Ações dos usuários</p>
                  <p className="text-xs text-white/30">{PERIODO_LABELS[periodo]}</p>
                </div>
              </div>
            </div>

            {/* Gráfico de tendência de views */}
            {data?.viewsPorDia && data.viewsPorDia.length > 0 && (
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base font-semibold text-white">Visualizações por dia (últimos 30 dias)</h2>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {(() => {
                    const max = Math.max(...data.viewsPorDia.map((v) => v.total), 1);
                    return data.viewsPorDia.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 group relative"
                        title={`${v.dia}: ${v.total} visualizações`}
                      >
                        <div
                          className="w-full bg-purple-600/60 hover:bg-purple-500 rounded-t transition-colors"
                          style={{ height: `${Math.max((v.total / max) * 100, 4)}%` }}
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {v.total}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/30">
                  {data.viewsPorDia.length > 0 && (
                    <>
                      <span>{data.viewsPorDia[0]?.dia}</span>
                      <span>{data.viewsPorDia[data.viewsPorDia.length - 1]?.dia}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Top repertórios e artigos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top repertórios */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Music className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base font-semibold text-white">Repertórios mais visualizados</h2>
                </div>
                {data?.topRepertorios && data.topRepertorios.length > 0 ? (
                  <ol className="space-y-3">
                    {data.topRepertorios.map((r, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{r.titulo || `Repertório #${r.referenciaId}`}</p>
                          {r.slug && (
                            <a
                              href={`/repertorio/${r.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-400 hover:text-purple-300 truncate block"
                            >
                              /repertorio/{r.slug}
                            </a>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-white/70 shrink-0">{r.total.toLocaleString("pt-BR")}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-white/30 text-center py-6">Nenhuma visualização registrada ainda.</p>
                )}
              </div>

              {/* Top artigos */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  <h2 className="text-base font-semibold text-white">Artigos mais acessados</h2>
                </div>
                {data?.topArtigos && data.topArtigos.length > 0 ? (
                  <ol className="space-y-3">
                    {data.topArtigos.map((a, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{a.titulo || `Artigo #${a.referenciaId}`}</p>
                          {a.slug && (
                            <a
                              href={`/blog/${a.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-400 hover:text-orange-300 truncate block"
                            >
                              /blog/{a.slug}
                            </a>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-white/70 shrink-0">{a.total.toLocaleString("pt-BR")}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-white/30 text-center py-6">Nenhuma visualização registrada ainda.</p>
                )}
              </div>
            </div>

            {/* Top músicas clicadas */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <MousePointerClick className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">Músicas mais clicadas</h2>
              </div>
              {data?.topMusicas && data.topMusicas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 pr-4 text-white/40 font-medium">#</th>
                        <th className="text-left py-2 pr-4 text-white/40 font-medium">Música</th>
                        <th className="text-left py-2 pr-4 text-white/40 font-medium hidden sm:table-cell">Repertório</th>
                        <th className="text-left py-2 pr-4 text-white/40 font-medium">Tipo</th>
                        <th className="text-right py-2 text-white/40 font-medium">Cliques</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topMusicas.map((m, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 pr-4 text-white/40">{i + 1}</td>
                          <td className="py-2.5 pr-4">
                            <p className="text-white font-medium truncate max-w-[180px]">{m.musicaTitulo}</p>
                            {m.musicaArtista && <p className="text-white/40 text-xs truncate">{m.musicaArtista}</p>}
                          </td>
                          <td className="py-2.5 pr-4 hidden sm:table-cell">
                            <p className="text-white/60 text-xs truncate max-w-[160px]">{m.repertorioTitulo || "—"}</p>
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-1.5">
                              {LINK_ICONS[m.tipoLink]}
                              <span className="text-white/60 capitalize text-xs">{m.tipoLink}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-semibold text-white/80">{m.total.toLocaleString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-white/30 text-center py-6">Nenhum clique registrado ainda.</p>
              )}
            </div>

            {/* Distribuição de ações e links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição de ações */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-semibold text-white">Ações dos usuários</h2>
                </div>
                {data?.distribuicaoAcoes && data.distribuicaoAcoes.length > 0 ? (
                  <div className="space-y-3">
                    {data.distribuicaoAcoes.map((a, i) => {
                      const maxVal = Math.max(...data.distribuicaoAcoes.map((x) => x.total), 1);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">{ACAO_LABELS[a.acao] || a.acao}</span>
                            <span className="text-white font-medium">{a.total.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500/70 rounded-full transition-all"
                              style={{ width: `${(a.total / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 text-center py-6">Nenhuma ação registrada ainda.</p>
                )}
              </div>

              {/* Distribuição de tipos de link */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <h2 className="text-base font-semibold text-white">Cliques por tipo de link</h2>
                </div>
                {data?.distribuicaoLinks && data.distribuicaoLinks.length > 0 ? (
                  <div className="space-y-3">
                    {data.distribuicaoLinks.map((l, i) => {
                      const maxVal = Math.max(...data.distribuicaoLinks.map((x) => x.total), 1);
                      const colors: Record<string, string> = {
                        youtube: "bg-red-500/70",
                        cifra: "bg-purple-500/70",
                        letra: "bg-blue-500/70",
                      };
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm items-center">
                            <div className="flex items-center gap-2">
                              {LINK_ICONS[l.tipoLink]}
                              <span className="text-white/70 capitalize">{l.tipoLink}</span>
                            </div>
                            <span className="text-white font-medium">{l.total.toLocaleString("pt-BR")}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${colors[l.tipoLink] || "bg-white/30"}`}
                              style={{ width: `${(l.total / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-white/30 text-center py-6">Nenhum clique registrado ainda.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
