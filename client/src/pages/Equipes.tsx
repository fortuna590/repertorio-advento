import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Users, Plus, Music, Heart, BookOpen, HandHeart, MoreHorizontal, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

const TIPO_ICONS = {
  musica: Music,
  grupo_oracao: Heart,
  leitura: BookOpen,
  acolhida: HandHeart,
  outro: MoreHorizontal,
};

const TIPO_LABELS = {
  musica: "Música",
  grupo_oracao: "Grupo de Oração",
  leitura: "Leitura",
  acolhida: "Acolhida",
  outro: "Outro",
};

export default function Equipes() {
  const { user, loading: authLoading } = useAuth();
  const { data: equipes, isLoading } = trpc.equipes.listar.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Minhas Equipes
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas equipes de música, grupo de oração e outros ministérios
              </p>
            </div>
            <Link href="/equipes/nova">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nova Equipe</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Lista de Equipes */}
      <main className="container py-8">
        {!equipes || equipes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma equipe cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Crie sua primeira equipe para começar a gerenciar escalas
              </p>
              <Link href="/equipes/nova">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Equipe
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipes.map((equipe) => {
              const Icon = TIPO_ICONS[equipe.tipo];
              return (
                <Link key={equipe.id} href={`/equipes/${equipe.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="truncate">{equipe.nome}</span>
                          </CardTitle>
                          <CardDescription>
                            <Badge variant="secondary" className="text-xs">
                              {TIPO_LABELS[equipe.tipo]}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {equipe.descricao && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {equipe.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {equipe.totalMembros} {equipe.totalMembros === 1 ? "membro" : "membros"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
