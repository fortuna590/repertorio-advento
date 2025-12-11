import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Music, Heart } from "lucide-react";
import { LiturgiaShare } from "@/components/LiturgiaShare";

interface LiturgiaData {
  data: string;
  liturgia: string;
  cor: string;
  coleta?: string;
  oferendas?: string;
  comunhao?: string;
  extras?: Array<{ titulo: string; texto: string }>;
  primeiraLeitura?: Array<{ referencia: string; titulo: string; texto: string }>;
  segundaLeitura?: Array<{ referencia: string; titulo: string; texto: string }>;
  salmo?: Array<{ referencia: string; titulo: string; texto: string }>;
  evangelho?: Array<{ referencia: string; titulo: string; texto: string }>;
}

export default function Liturgia() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("liturgiaFavoritos");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Verificar se data atual é favorita
  useEffect(() => {
    const dateStr = formatDateToAPI(selectedDate);
    setIsFavorite(favorites.includes(dateStr));
  }, [selectedDate, favorites]);

  // Query para buscar liturgia
  const { data: liturgiaResponse, isLoading, error } = trpc.liturgias.getByDate.useQuery(
    {
      dia: selectedDate.getDate(),
      mes: selectedDate.getMonth() + 1,
      ano: selectedDate.getFullYear(),
    },
    {
      enabled: true,
    }
  );

  const liturgia = liturgiaResponse?.data as LiturgiaData | undefined;

  function formatDateToAPI(date: Date): string {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  function formatDateDisplay(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("pt-BR", options);
  }

  function goToPreviousDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  }

  function goToNextDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  function toggleFavorite() {
    const dateStr = formatDateToAPI(selectedDate);
    let newFavorites: string[];

    if (isFavorite) {
      newFavorites = favorites.filter((d) => d !== dateStr);
    } else {
      newFavorites = [...favorites, dateStr];
    }

    setFavorites(newFavorites);
    localStorage.setItem("liturgiaFavoritos", JSON.stringify(newFavorites));
  }

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const dateStr = e.target.value;
    if (dateStr) {
      setSelectedDate(new Date(dateStr));
    }
  }

  const getColorClass = (cor: string): string => {
    const colorMap: Record<string, string> = {
      Branco: "bg-white text-gray-900",
      Roxo: "bg-purple-600 text-white",
      Verde: "bg-green-600 text-white",
      Vermelho: "bg-red-600 text-white",
      Rosa: "bg-pink-500 text-white",
      Negro: "bg-gray-900 text-white",
    };
    return colorMap[cor] || "bg-purple-600 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Liturgia Diária</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Acompanhe as leituras, evangelhos e salmos de cada dia
          </p>
        </div>

        {/* Seletor de Data */}
        <Card className="bg-slate-800 border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Selecione uma Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Navegação por dia */}
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={goToPreviousDay}
                variant="outline"
                className="border-purple-500/30 hover:bg-purple-500/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1">
                <input
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={handleDateInput}
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white text-center focus:outline-none focus:border-purple-500"
                />
              </div>

              <Button
                onClick={goToNextDay}
                variant="outline"
                className="border-purple-500/30 hover:bg-purple-500/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Data formatada e botão de hoje */}
            <div className="flex items-center justify-between">
              <p className="text-gray-300 capitalize">{formatDateDisplay(selectedDate)}</p>
              <Button
                onClick={goToToday}
                variant="secondary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Hoje
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Carregando */}
        {isLoading && (
          <Card className="bg-slate-800 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                <p className="text-gray-300">Carregando liturgia...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Erro */}
        {error && !isLoading && (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="pt-6">
              <p className="text-red-300">
                Erro ao carregar liturgia. Tente novamente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Liturgia */}
        {liturgia && !isLoading && (
          <div className="space-y-6">
            {/* Card Principal */}
            <Card className="bg-slate-800 border-purple-500/30 overflow-hidden">
              <CardHeader className={`${getColorClass(liturgia.cor)} py-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{liturgia.liturgia}</CardTitle>
                    <CardDescription className="text-sm opacity-90">
                      {liturgia.data}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={toggleFavorite}
                    variant="ghost"
                    size="icon"
                    className={`${
                      isFavorite
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardHeader>

              {/* Compartilhamento */}
              <div className="px-6 pt-4 pb-2 border-b border-purple-500/20">
                <LiturgiaShare 
                  data={liturgia.data} 
                  liturgia={liturgia.liturgia}
                  url={typeof window !== "undefined" ? window.location.href : ""}
                />
              </div>

              <CardContent className="pt-6 space-y-6">
                {/* Orações */}
                {(liturgia.coleta || liturgia.oferendas || liturgia.comunhao) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      Orações
                    </h3>

                    {liturgia.coleta && (
                      <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-semibold text-white mb-2">Coleta</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {liturgia.coleta}
                        </p>
                      </div>
                    )}

                    {liturgia.oferendas && (
                      <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-semibold text-white mb-2">Oferendas</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {liturgia.oferendas}
                        </p>
                      </div>
                    )}

                    {liturgia.comunhao && (
                      <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-semibold text-white mb-2">Comunhão</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {liturgia.comunhao}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Leituras */}
                {liturgia.primeiraLeitura && liturgia.primeiraLeitura.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300">Primeira Leitura</h3>
                    {liturgia.primeiraLeitura.map((leitura, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-purple-300 text-sm font-semibold mb-2">
                          {leitura.referencia}
                        </p>
                        <p className="text-gray-300 italic text-sm mb-3">{leitura.titulo}</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {leitura.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Salmo */}
                {liturgia.salmo && liturgia.salmo.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300">Salmo</h3>
                    {liturgia.salmo.map((salmo, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="text-green-400 text-sm font-semibold mb-2">
                          {salmo.referencia}
                        </p>
                        <p className="text-gray-300 italic text-sm mb-3">{salmo.titulo}</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {salmo.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Segunda Leitura */}
                {liturgia.segundaLeitura && liturgia.segundaLeitura.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300">Segunda Leitura</h3>
                    {liturgia.segundaLeitura.map((leitura, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-purple-300 text-sm font-semibold mb-2">
                          {leitura.referencia}
                        </p>
                        <p className="text-gray-300 italic text-sm mb-3">{leitura.titulo}</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {leitura.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evangelho */}
                {liturgia.evangelho && liturgia.evangelho.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-red-400">Evangelho</h3>
                    {liturgia.evangelho.map((evangelho, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-red-500">
                        <p className="text-red-400 text-sm font-semibold mb-2">
                          {evangelho.referencia}
                        </p>
                        <p className="text-gray-300 italic text-sm mb-3">{evangelho.titulo}</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {evangelho.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extras */}
                {liturgia.extras && liturgia.extras.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300">Observações Especiais</h3>
                    {liturgia.extras.map((extra, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-yellow-400 text-sm font-semibold mb-2">
                          {extra.titulo}
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {extra.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dica de Favoritos */}
            {!isFavorite && (
              <Card className="bg-purple-900/30 border-purple-500/30">
                <CardContent className="pt-6">
                  <p className="text-purple-300 text-sm">
                    💡 Clique no ícone de coração para salvar esta liturgia nos favoritos!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
