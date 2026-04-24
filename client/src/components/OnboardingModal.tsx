import { useState, useEffect } from "react";
import { X, Music2, BookOpen, Star, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const STORAGE_KEY = "louvamais_onboarding_done";

const PASSOS = [
  {
    icone: <Music2 className="w-8 h-8 text-purple-300" />,
    gradiente: "from-purple-600/30 to-purple-900/20",
    borda: "border-purple-500/30",
    numero: "01",
    titulo: "Explore repertórios prontos",
    descricao:
      "Encontre sugestões completas de músicas organizadas por tempo litúrgico — Advento, Quaresma, Páscoa e muito mais.",
  },
  {
    icone: <BookOpen className="w-8 h-8 text-pink-300" />,
    gradiente: "from-pink-600/30 to-pink-900/20",
    borda: "border-pink-500/30",
    numero: "02",
    titulo: "Aprenda com os artigos",
    descricao:
      "Entenda o que cantar em cada momento da Missa com conteúdos litúrgicos escritos para músicos e cantores.",
  },
  {
    icone: <Star className="w-8 h-8 text-amber-300" />,
    gradiente: "from-amber-600/30 to-amber-900/20",
    borda: "border-amber-500/30",
    numero: "03",
    titulo: "Crie e salve seus repertórios",
    descricao:
      "Organize suas músicas favoritas, monte seu próprio repertório e exporte para usar na sua próxima celebração.",
  },
];

export default function OnboardingModal() {
  const [visivel, setVisivel] = useState(false);
  const [passo, setPasso] = useState(0);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    // Mostrar apenas se ainda não foi exibido
    const jaViu = localStorage.getItem(STORAGE_KEY);
    if (!jaViu) {
      // Pequeno delay para não aparecer imediatamente ao carregar
      const timer = setTimeout(() => setVisivel(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function fechar() {
    setSaindo(true);
    setTimeout(() => {
      setVisivel(false);
      setSaindo(false);
      localStorage.setItem(STORAGE_KEY, "1");
    }, 300);
  }

  function proximo() {
    if (passo < PASSOS.length - 1) {
      setPasso(passo + 1);
    } else {
      fechar();
    }
  }

  if (!visivel) return null;

  const passoAtual = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        saindo ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && fechar()}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
          saindo ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #13111e 100%)" }}
      >
        {/* Botão fechar */}
        <button
          onClick={fechar}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho com logo */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #9333ea, #ec4899)" }}
          >
            <Music2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">
            Louva<span className="gradient-text">Mais</span>
          </span>
          <span className="ml-auto text-xs text-white/30 font-mono">{passo + 1}/{PASSOS.length}</span>
        </div>

        {/* Conteúdo do passo */}
        <div className="px-6 pb-6">
          {/* Card do passo */}
          <div
            className={`rounded-xl border bg-gradient-to-br ${passoAtual.gradiente} ${passoAtual.borda} p-6 mb-6 transition-all duration-300`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5 shrink-0">
                {passoAtual.icone}
              </div>
              <div>
                <span className="text-xs font-mono text-white/30 mb-1 block">{passoAtual.numero}</span>
                <h3 className="text-lg font-bold text-white mb-2">{passoAtual.titulo}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{passoAtual.descricao}</p>
              </div>
            </div>
          </div>

          {/* Indicadores de passo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {PASSOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setPasso(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === passo
                    ? "w-6 h-2 bg-purple-500"
                    : i < passo
                    ? "w-2 h-2 bg-purple-500/50"
                    : "w-2 h-2 bg-white/20"
                }`}
                aria-label={`Ir para passo ${i + 1}`}
              />
            ))}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            {ultimo ? (
              <Link
                href="/repertorios"
                onClick={fechar}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}
              >
                Começar agora
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={proximo}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={fechar}
              className="px-5 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
