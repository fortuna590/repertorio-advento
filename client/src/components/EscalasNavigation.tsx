import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Calendar, ListChecks, ArrowLeft } from "lucide-react";

export function EscalasNavigation() {
  const [location] = useLocation();

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
              className={isActive("/minhas-escalas") 
                ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                : "text-purple-300 hover:text-white hover:bg-purple-900/50"
              }
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Minhas Escalas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
