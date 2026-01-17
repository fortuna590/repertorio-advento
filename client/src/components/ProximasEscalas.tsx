import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Music, Users, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const ICONS = {
  musicos: Music,
  reuniao: Users,
  grupo_oracao: Heart,
  personalizado: Sparkles,
};

export default function ProximasEscalas() {
  const { user } = useAuth();

  const { data: escalas, isLoading } = trpc.escalas.proximasEscalas.useQuery(
    {
      userId: user?.openId || "",
      limite: 3,
    },
    {
      enabled: !!user?.openId,
    }
  );

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-2xl">Próximas Escalas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!escalas || escalas.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-2xl">Próximas Escalas</CardTitle>
          <CardDescription>Você não tem escalas agendadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/escalas">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Criar Nova Escala
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Próximas Escalas
        </CardTitle>
        <CardDescription>Suas escalas agendadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {escalas.map((escala) => {
          const Icon = ICONS[escala.tipo as keyof typeof ICONS] || Sparkles;
          const dataFormatada = new Date(escala.data).toLocaleDateString("pt-BR");

          return (
            <Link key={escala.id} href={`/escala/${escala.id}`}>
              <div className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">{escala.titulo}</h3>
                  </div>
                </div>
                
                {escala.descricao && (
                  <p className="text-sm text-gray-600 mb-3">{escala.descricao}</p>
                )}

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dataFormatada}
                  </div>
                  {escala.hora && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {escala.hora}
                    </div>
                  )}
                  {escala.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {escala.local}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        <Link href="/escalas">
          <Button variant="outline" className="w-full mt-4">
            Ver Todas as Escalas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
