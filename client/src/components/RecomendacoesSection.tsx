import { useLocation } from "wouter";
import { BookOpen, Music2, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RepertorioCard {
  id: number;
  titulo: string;
  slug: string;
  tempoLiturgico: string;
  categoria?: string | null;
  descricao?: string | null;
  tags?: string | null;
}

interface ArtigoCard {
  id: number;
  titulo: string;
  slug: string;
  resumo?: string | null;
  categoria?: string | null;
  imagemCapa?: string | null;
  tags?: string | null;
}

interface RecomendacoesSectionProps {
  repertorios?: RepertorioCard[];
  artigos?: ArtigoCard[];
  isLoading?: boolean;
  titulo?: string;
}

// ─── Labels e cores por tempo litúrgico ───────────────────────────────────────

const TEMPO_LABEL: Record<string, string> = {
  ADVENTO: "Advento",
  NATAL: "Natal",
  QUARESMA: "Quaresma",
  PASCOA: "Páscoa",
  TEMPO_COMUM: "Tempo Comum",
  CELEBRACOES: "Celebrações",
  GERAL: "Geral",
};

const TEMPO_COLOR: Record<string, string> = {
  ADVENTO: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  NATAL: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  QUARESMA: "bg-purple-600/20 text-purple-300 border-purple-600/30",
  PASCOA: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  TEMPO_COMUM: "bg-green-600/20 text-green-300 border-green-600/30",
  CELEBRACOES: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  GERAL: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

// ─── Sub-componente: Card de Repertório ───────────────────────────────────────

function RepertorioCardItem({ item }: { item: RepertorioCard }) {
  const [, setLocation] = useLocation();
  const tempoLabel = TEMPO_LABEL[item.tempoLiturgico] ?? item.tempoLiturgico;
  const tempoColor = TEMPO_COLOR[item.tempoLiturgico] ?? TEMPO_COLOR.GERAL;

  return (
    <button
      onClick={() => setLocation(`/repertorio/${item.slug}`)}
      className="group w-full text-left bg-card border border-border/50 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors">
          <Music2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {item.titulo}
          </p>
          {item.descricao && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {item.descricao}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${tempoColor}`}>
              {tempoLabel}
            </span>
            {item.categoria && (
              <span className="text-[10px] text-muted-foreground">
                {item.categoria}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="shrink-0 w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

// ─── Sub-componente: Card de Artigo ───────────────────────────────────────────

function ArtigoCardItem({ item }: { item: ArtigoCard }) {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation(`/blog/${item.slug}`)}
      className="group w-full text-left bg-card border border-border/50 rounded-xl p-4 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 rounded-lg bg-secondary/15 group-hover:bg-secondary/25 transition-colors">
          <BookOpen className="w-4 h-4 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
            {item.titulo}
          </p>
          {item.resumo && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {item.resumo}
            </p>
          )}
          {item.categoria && (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border bg-secondary/15 text-secondary border-secondary/25 mt-2">
              {item.categoria}
            </span>
          )}
        </div>
        <ArrowRight className="shrink-0 w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

// ─── Skeleton de carregamento ─────────────────────────────────────────────────

function RecomendacoesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border/50 rounded-xl p-4 flex items-start gap-3">
          <Skeleton className="shrink-0 w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function RecomendacoesSection({
  repertorios = [],
  artigos = [],
  isLoading = false,
  titulo = "Você também pode gostar",
}: RecomendacoesSectionProps) {
  // Não renderiza se não há nada para mostrar e não está carregando
  if (!isLoading && repertorios.length === 0 && artigos.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-10 border-t border-border/40">
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/15">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{titulo}</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5" /> Repertórios
            </p>
            <RecomendacoesSkeleton />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Artigos
            </p>
            <RecomendacoesSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna de Repertórios */}
          {repertorios.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" /> Repertórios relacionados
              </p>
              <div className="space-y-3">
                {repertorios.map((r) => (
                  <RepertorioCardItem key={r.id} item={r} />
                ))}
              </div>
            </div>
          )}

          {/* Coluna de Artigos */}
          {artigos.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Artigos relacionados
              </p>
              <div className="space-y-3">
                {artigos.map((a) => (
                  <ArtigoCardItem key={a.id} item={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default RecomendacoesSection;
