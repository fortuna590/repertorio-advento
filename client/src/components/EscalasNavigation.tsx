import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, ListChecks, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function EscalasNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: contadorPendentes } = trpc.escalas.contarPendentes.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id, refetchInterval: 30000 } // Atualiza a cada 30 segundos
  );

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm mb-6">
      <div className="container py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white hover:bg-purple-900/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-purple-500/30" />
          
          <Link href="/escalas">
            <Button 
              variant={isActive("/escalas") ? "default" : "ghost"} 
              size="sm"
              className={isActive("/escalas") 
                ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                : "text-purple-300 hover:text-white hover:bg-purple-900/50"
              }
            >
              <Calendar className="w-4 h-4 mr-2" />
              Gerenciar Escalas
            </Button>
          </Link>
          
          <Link href="/minhas-escalas">
            <Button 
              variant={isActive("/minhas-escalas") ? "default" : "ghost"} 
              size="sm"
              className={`relative ${isActive("/minhas-escalas") 
                ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                : "text-purple-300 hover:text-white hover:bg-purple-900/50"
              }`}
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Minhas Escalas
              {contadorPendentes && contadorPendentes.count > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 px-1.5 py-0 h-5 min-w-[20px] text-xs font-bold"
                >
                  {contadorPendentes.count}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
