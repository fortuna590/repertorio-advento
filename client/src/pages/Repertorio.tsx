import { useState } from "react";
import { repertoriosBase } from "@/data/repertoriosBase";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Youtube, Guitar, BookOpen, ChevronDown, Loader2 } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

export default function Repertorio() {
  const [expandedRepertorio, setExpandedRepertorio] = useState<string | null>(null);
  const [expandedMomento, setExpandedMomento] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 shadow-lg shadow-primary/20">
              <Music className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 tracking-tight">
                Repertórios Litúrgicos
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Explore músicas organizadas por tempo litúrgico
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 md:py-12">
        <div className="space-y-6">
          {repertoriosBase.map((repertorio) => (
            <RepertorioCard
              key={repertorio.id}
              repertorio={repertorio}
              isExpanded={expandedRepertorio === repertorio.id}
              onToggle={() =>
                setExpandedRepertorio(
                  expandedRepertorio === repertorio.id ? null : repertorio.id
                )
              }
              expandedMomento={expandedMomento}
              onToggleMomento={setExpandedMomento}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <SocialLinks />
        </div>
      </footer>
    </div>
  );
}

interface RepertorioCardProps {
  repertorio: (typeof repertoriosBase)[0];
  isExpanded: boolean;
  onToggle: () => void;
  expandedMomento: string | null;
  onToggleMomento: (momentoId: string | null) => void;
}

function RepertorioCard({
  repertorio,
  isExpanded,
  onToggle,
  expandedMomento,
  onToggleMomento,
}: RepertorioCardProps) {
  const { data: musicas, isLoading } = trpc.musicasBase.listar.useQuery(
    { repertorioId: repertorio.id },
    { enabled: isExpanded }
  );

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full text-left"
      >
        <CardHeader className="pb-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                {repertorio.titulo}
              </CardTitle>
              <CardDescription className="text-base">
                {repertorio.descricao}
              </CardDescription>
            </div>
            <ChevronDown
              className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>
      </button>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !musicas || musicas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma música adicionada ainda neste repertório.
            </p>
          ) : (
            <div className="space-y-4">
              {repertorio.momentos.map((momento) => {
                const musicasMomento = musicas.filter(
                  (m) => m.momentoId === momento.id
                );

                if (musicasMomento.length === 0) return null;

                return (
                  <MomentoSection
                    key={momento.id}
                    momento={momento}
                    musicas={musicasMomento}
                    isExpanded={expandedMomento === momento.id}
                    onToggle={() =>
                      onToggleMomento(
                        expandedMomento === momento.id ? null : momento.id
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface MomentoSectionProps {
  momento: any;
  musicas: any[];
  isExpanded: boolean;
  onToggle: () => void;
}

function MomentoSection({
  momento,
  musicas,
  isExpanded,
  onToggle,
}: MomentoSectionProps) {
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-accent/5 transition-colors flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg font-semibold text-primary">
            {momento.numero}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{momento.titulo}</h3>
            <p className="text-sm text-muted-foreground">
              {musicas.length} música(s)
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="bg-accent/5 border-t border-border/30 p-4 space-y-3">
          {musicas.map((musica) => (
            <MusicaItem key={musica.id} musica={musica} />
          ))}
        </div>
      )}
    </div>
  );
}

interface MusicaItemProps {
  musica: any;
}

function MusicaItem({ musica }: MusicaItemProps) {
  return (
    <div className="p-3 bg-card/50 rounded-lg border border-border/30 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{musica.titulo}</h4>
          {musica.artista && (
            <p className="text-sm text-muted-foreground">{musica.artista}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {musica.youtube && (
          <a
            href={musica.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md transition-colors"
          >
            <Youtube className="w-4 h-4" />
            YouTube
          </a>
        )}

        {musica.cifra && (
          <a
            href={musica.cifra}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-md transition-colors"
          >
            <Guitar className="w-4 h-4" />
            Cifra
          </a>
        )}

        {musica.letra && (
          <a
            href={musica.letra}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-md transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Letra
          </a>
        )}
      </div>
    </div>
  );
}
