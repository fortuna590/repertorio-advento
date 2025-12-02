import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ListMusic,
  Music,
  BookOpen,
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface QuickAccessItem {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

export function QuickAccess() {
  const items: QuickAccessItem[] = [
    {
      href: "/montar-repertorio",
      title: "Montar Repertório",
      description: "Crie seu próprio repertório personalizado",
      icon: <ListMusic className="w-6 h-6" />,
      color: "from-secondary/20 to-secondary/10",
      badge: "Em Breve",
    },
    {
      href: "/repertorio",
      title: "Repertório Advento",
      description: "29 músicas litúrgicas para o Advento",
      icon: <Music className="w-6 h-6" />,
      color: "from-primary/20 to-primary/10",
    },
    {
      href: "/blog",
      title: "Blog",
      description: "Artigos sobre música litúrgica",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500/20 to-blue-500/10",
    },
    {
      href: "/produtos",
      title: "Produtos",
      description: "Livros e recursos litúrgicos",
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "from-amber-500/20 to-amber-500/10",
    },
    {
      href: "/doacao",
      title: "Apoie o Projeto",
      description: "Contribua para manter o projeto",
      icon: <Heart className="w-6 h-6" />,
      color: "from-red-500/20 to-red-500/10",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-secondary" />
            Acesso Rápido
          </h2>
          <p className="text-lg text-muted-foreground">
            Navegue rapidamente pelas principais funcionalidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className={`group cursor-pointer h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 bg-gradient-to-br ${item.color} border-border/50`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-background/50 group-hover:bg-background transition-colors">
                      {item.icon}
                    </div>
                    {item.badge && (
                      <span className="text-xs font-semibold bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">
                    {item.description}
                  </CardDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary"
                  >
                    <span>Acessar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
