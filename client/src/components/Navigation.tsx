import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  Heart, 
  ShoppingBag, 
  BookOpen, 
  Church, 
  Menu, 
  X,
  ListMusic,
  Home as HomeIcon,
  Calendar
} from "lucide-react";
import { APP_LOGO } from "@/const";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/montar-repertorio", label: "Montar Repertório", icon: ListMusic, highlight: true },
    { href: "/liturgia", label: "Liturgia Diária", icon: Calendar },
    { href: "/produtos", label: "Produtos", icon: ShoppingBag },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/sobre", label: "Sobre", icon: Church },
  ];

  const actionItems = [
    { href: "/doacao", label: "Apoie o Projeto", icon: Heart, variant: "default" as const },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <img src={APP_LOGO} alt="LouvaMais" className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-bold text-sm md:text-base text-foreground">LouvaMais</div>
                <div className="text-xs text-muted-foreground">Repertório Católico</div>
              </div>
            </button>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`gap-2 ${item.highlight ? 'text-secondary font-semibold' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={item.variant} 
                    size="sm" 
                    className="gap-2 hidden sm:flex bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden border-t border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="container py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                          Novo
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-border/50">
                {actionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 transition-colors text-left font-medium text-primary"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
