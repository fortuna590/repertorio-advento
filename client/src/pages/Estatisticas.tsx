import { Card } from "@/components/ui/card";
import { BarChart3, Music, Users, TrendingUp, Eye, Download } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

function RepertoriosMaisAcessados() {
  const { data: repertorios, isLoading } = trpc.repertorios.getMaisAcessados.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  if (!repertorios || repertorios.length === 0) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <p className="text-purple-200 text-center py-8">Nenhum repertório público disponível ainda</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-slate-800 border-purple-500/20">
      <div className="space-y-4">
        {repertorios.map((repertorio, index) => (
          <a
            key={repertorio.id}
            href={`/repertorio/${repertorio.id}`}
            className="flex items-center gap-4 hover:bg-purple-500/5 p-3 rounded-lg transition-all duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{repertorio.nome}</p>
              {repertorio.descricao && (
                <p className="text-purple-300 text-sm truncate">{repertorio.descricao}</p>
              )}
              <p className="text-purple-400 text-xs">
                {repertorio.totalMusicas} músicas • {repertorio.nomeUsuario || "Anônimo"}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-white font-bold">{repertorio.visualizacoes}</p>
              <p className="text-purple-300 text-xs">visualizações</p>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}

function ArtigosMaisVisualizados() {
  const { data: artigos, isLoading } = trpc.artigos.getAll.useQuery();

  if (isLoading) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  const artigosOrdenados = (artigos || [])
    .filter((a: any) => a.publicado === 1)
    .sort((a: any, b: any) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
    .slice(0, 10);

  if (!artigosOrdenados || artigosOrdenados.length === 0) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <p className="text-purple-200 text-center py-8">Nenhum artigo visualizado ainda</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-slate-800 border-purple-500/20">
      <div className="space-y-4">
        {artigosOrdenados.map((artigo: any, index: number) => (
          <a
            key={artigo.id}
            href={`/blog/${artigo.slug}`}
            className="flex items-center gap-4 hover:bg-purple-500/5 p-3 rounded-lg transition-all duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{artigo.titulo}</p>
              {artigo.resumo && (
                <p className="text-purple-300 text-sm truncate">{artigo.resumo}</p>
              )}
              <p className="text-purple-400 text-xs">{artigo.categoria || 'Artigo'}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-white font-bold">{artigo.visualizacoes || 0}</p>
              <p className="text-purple-300 text-xs">visualizações</p>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}

function RepertoriosAdminMaisCompartilhados() {
  const { data: repertorios, isLoading } = (trpc as any).repertorio.list.useQuery();

  if (isLoading) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  const repertoriosOrdenados = (repertorios || [])
    .sort((a: any, b: any) => (b.compartilhamentos || 0) - (a.compartilhamentos || 0))
    .slice(0, 10);

  if (!repertoriosOrdenados || repertoriosOrdenados.length === 0) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <p className="text-purple-200 text-center py-8">Nenhum repertório compartilhado ainda</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-slate-800 border-purple-500/20">
      <div className="space-y-4">
        {repertoriosOrdenados.map((repertorio: any, index: number) => (
          <a
            key={repertorio.id}
            href={`/repertorio-admin/${repertorio.id}`}
            className="flex items-center gap-4 hover:bg-purple-500/5 p-3 rounded-lg transition-all duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{repertorio.nome}</p>
              {repertorio.descricao && (
                <p className="text-purple-300 text-sm truncate">{repertorio.descricao}</p>
              )}
              <p className="text-purple-400 text-xs">Repertório Personalizado</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-white font-bold">{repertorio.compartilhamentos || 0}</p>
              <p className="text-purple-300 text-xs">compartilhamentos</p>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}

function RepertoriosAdminMaisAcessados() {
  const { data: repertorios, isLoading } = (trpc as any).repertorio.list.useQuery();

  if (isLoading) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  const repertoriosOrdenados = (repertorios || [])
    .sort((a: any, b: any) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
    .slice(0, 10);

  if (!repertoriosOrdenados || repertoriosOrdenados.length === 0) {
    return (
      <Card className="p-8 bg-slate-800 border-purple-500/20">
        <p className="text-purple-200 text-center py-8">Nenhum repertório admin disponível ainda</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-slate-800 border-purple-500/20">
      <div className="space-y-4">
        {repertoriosOrdenados.map((repertorio: any, index: number) => (
          <div
            key={repertorio.id}
            className="flex items-center gap-4 hover:bg-purple-500/5 p-3 rounded-lg transition-all duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{repertorio.nome}</p>
              {repertorio.descricao && (
                <p className="text-purple-300 text-sm truncate">{repertorio.descricao}</p>
              )}
              <p className="text-purple-400 text-xs">Repertório Personalizado</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-white font-bold">{repertorio.visualizacoes || 0}</p>
              <p className="text-purple-300 text-xs">visualizações</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Estatisticas() {
  const { data: stats, isLoading } = trpc.clicks.getSiteStats.useQuery();
  const { data: clickStats } = trpc.clicks.getStats.useQuery();
  const { data: musicasAdminMaisClicadas } = (trpc as any).repertorio.getMusicasAdminMaisClicadas.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const siteStats = stats || {
    totalMusicas: 29,
    totalVisualizacoes: 0,
    totalDownloads: 0,
    totalMinisterios: 0,
    totalArtigos: 0
  };

  const clickStatsByMomento = clickStats?.clicksByMomento || [];
  const clickStatsByType = clickStats?.clicksByType || [];
  const clickStatsByMusica = clickStats?.clicksByMusica || [];
  const totalClicks = clickStats?.totalClicks || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Estatísticas</h1>
          <p className="text-xl text-purple-200">
            Acompanhe o crescimento e impacto do LouvaMais
          </p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 bg-gradient-to-br from-purple-600/20 to-purple-600/10 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-purple-400" />
              <span className="text-xs bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{siteStats.totalMusicas}</p>
            <p className="text-purple-200">Músicas Litúrgicas</p>
            <p className="text-xs text-purple-400 mt-2">Repertório do Advento</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-pink-600/20 to-pink-600/10 border-pink-500/30">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-pink-400" />
              <span className="text-xs bg-pink-500/30 text-pink-200 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{siteStats.totalVisualizacoes.toLocaleString()}</p>
            <p className="text-pink-200">Visualizações</p>
            <p className="text-xs text-pink-400 mt-2">Cliques em links</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-blue-600/20 to-blue-600/10 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Download className="w-8 h-8 text-blue-400" />
              <span className="text-xs bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{siteStats.totalDownloads}</p>
            <p className="text-blue-200">Downloads</p>
            <p className="text-xs text-blue-400 mt-2">Repertórios criados</p>
          </Card>


        </div>

        {/* Total de Cliques */}
        <div className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-indigo-600/20 to-indigo-600/10 border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 mb-2">Total Geral de Cliques</p>
                <p className="text-5xl font-bold text-white">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="text-6xl opacity-20">📊</div>
            </div>
          </Card>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Momentos da Missa Mais Acessados</h3>
            <div className="space-y-4">
              {clickStatsByMomento.length > 0 ? (
                clickStatsByMomento.slice(0, 5).map((item) => {
                  const maxCount = Math.max(...clickStatsByMomento.map(i => i.count), 1);
                  const percentage = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.momentoId}>
                      <div className="flex justify-between mb-2">
                        <span className="text-purple-200">{item.momentoTitulo}</span>
                        <span className="text-white font-semibold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-purple-200 text-sm">Nenhum dado disponível ainda</p>
              )}
            </div>
          </Card>

          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Recursos Mais Utilizados</h3>
            <div className="space-y-4">
              {clickStatsByType.length > 0 ? (
                clickStatsByType.map((item) => {
                  const totalClicks = clickStatsByType.reduce((sum, i) => sum + i.count, 0);
                  const percentage = Math.round((item.count / totalClicks) * 100);
                  const label = item.type === 'youtube' ? 'YouTube' : 'Cifra Club';
                  return (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-purple-200">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-8 text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-purple-200 text-sm">Nenhum dado disponível ainda</p>
              )}
            </div>
          </Card>
        </div>

        {/* Músicas Mais Acessadas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Músicas Mais Acessadas</h2>
          <Card className="p-8 bg-slate-800 border-purple-500/20">
            {clickStatsByMusica.length > 0 ? (
              <div className="space-y-4">
                {clickStatsByMusica.slice(0, 10).map((musica, index) => (
                  <div key={`${musica.musicaId}-${musica.linkType}`} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{musica.musicaTitulo}</p>
                      <p className="text-purple-300 text-sm truncate">{musica.musicaArtista}</p>
                      <p className="text-purple-400 text-xs">{musica.momentoTitulo} • {musica.linkType === 'youtube' ? 'YouTube' : 'Cifra Club'}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-white font-bold">{musica.count}</p>
                      <p className="text-purple-300 text-xs">cliques</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-200 text-center py-8">Nenhum dado de músicas disponível ainda</p>
            )}
          </Card>
        </div>

        {/* Músicas Admin Mais Clicadas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Músicas Personalizadas Mais Clicadas</h2>
          <Card className="p-8 bg-slate-800 border-purple-500/20">
            {musicasAdminMaisClicadas && musicasAdminMaisClicadas.length > 0 ? (
              <div className="space-y-4">
                {musicasAdminMaisClicadas.map((musica: any, index: number) => (
                  <div key={musica.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{musica.titulo}</p>
                      {musica.artista && (
                        <p className="text-purple-300 text-sm truncate">{musica.artista}</p>
                      )}
                      <p className="text-purple-400 text-xs">Repertório ID: {musica.repertorioId}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-white font-bold">{musica.totalCliques}</p>
                      <p className="text-purple-300 text-xs">cliques</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-200 text-center py-8">Nenhuma música personalizada clicada ainda</p>
            )}
          </Card>
        </div>

        {/* Artigos Mais Compartilhados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Artigos Mais Visualizados</h2>
          <ArtigosMaisVisualizados />
        </div>

        {/* Repertórios Admin Mais Compartilhados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Repertórios Personalizados Mais Compartilhados</h2>
          <RepertoriosAdminMaisCompartilhados />
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Insights Principais</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Engajamento em Alta</h3>
                <p className="text-purple-200 text-sm">
                  {siteStats.totalVisualizacoes > 0 
                    ? `${siteStats.totalVisualizacoes} cliques registrados mostram engajamento crescente com o repertório.`
                    : 'Os usuários estão começando a explorar o repertório.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Comunidade em Crescimento</h3>
                <p className="text-purple-200 text-sm">
                  {siteStats.totalMinisterios > 0
                    ? `${siteStats.totalMinisterios} ministérios já criaram seus repertórios personalizados.`
                    : 'A comunidade está começando a utilizar a plataforma.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Conteúdo Educativo</h3>
                <p className="text-purple-200 text-sm">
                  {siteStats.totalArtigos > 0
                    ? `${siteStats.totalArtigos} artigos publicados para enriquecer a experiência dos usuários.`
                    : 'Conteúdo educativo em desenvolvimento para apoiar os ministérios.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Potencial de Expansão</h3>
                <p className="text-purple-200 text-sm">
                  Com {siteStats.totalMusicas} músicas do Advento e crescimento consistente, há grande potencial para expandir para outras liturgias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                <span className="font-bold text-white">LouvaMais</span>
              </div>
              <p className="text-purple-200 text-sm">
                Músicas litúrgicas para enriquecer suas celebrações
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
              <nav className="space-y-2">
                <a href="/repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Repertório
                </a>
                <a href="/blog" className="text-purple-200 hover:text-white transition text-sm block">
                  Blog
                </a>
                <a href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                  Sobre
                </a>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
              <SocialLinks layout="horizontal" size="small" />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-purple-200 text-sm">
            <p>© 2025 LouvaMais. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
