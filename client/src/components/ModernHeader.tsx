import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Music2 } from "lucide-react";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/repertorios", label: "Repertórios" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre", label: "Sobre" },
];

export default function ModernHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110" style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)" }}>
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-white">Louva<span className="gradient-text">Mais</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === n.href ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 py-3" style={{ background: "rgba(10,10,15,0.95)" }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors ${
                location === n.href ? "text-white bg-white/5" : "text-white/60 hover:text-white"
              }`}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
