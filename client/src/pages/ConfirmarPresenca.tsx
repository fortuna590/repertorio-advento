import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmarPresenca() {
  const [, params] = useRoute("/confirmar/:token");
  const token = params?.token || "";
  const [confirmado, setConfirmado] = useState(false);

  const { data: info, isLoading, error } = trpc.escalas.buscarPorToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const confirmarMutation = trpc.escalas.confirmarPorToken.useMutation({
    onSuccess: () => {
      setConfirmado(true);
      toast.success("Presença confirmada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao confirmar presença: " + error.message);
    },
  });

  const handleConfirmar = () => {
    confirmarMutation.mutate({ token });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando informações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
            <p className="text-gray-600">
              Este link de confirmação não é válido ou já expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmado || info.status === "confirmado") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Presença Confirmada!</h2>
            <p className="text-gray-600 mb-6">
              Sua presença foi confirmada com sucesso.
            </p>
            
            <div className="bg-purple-50 rounded-lg p-4 text-left space-y-2">
              <h3 className="font-semibold text-gray-900 mb-3">{info.escala}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {new Date(info.data).toLocaleDateString("pt-BR")}
              </div>
              {info.hora && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {info.hora}
                </div>
              )}
              {info.local && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {info.local}
                </div>
              )}
              <div className="pt-2 border-t border-purple-200 mt-3">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Função:</span> {info.funcao}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Aguardamos você! 🙏
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Confirmar Presença</CardTitle>
          <CardDescription className="text-center">
            Por favor, confirme sua participação na escala
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Participante</p>
              <p className="font-semibold text-gray-900">{info.participante}</p>
            </div>
            
            <div className="border-t border-purple-200 pt-3">
              <p className="text-sm text-gray-600 mb-2">Escala</p>
              <h3 className="font-semibold text-gray-900 mb-3">{info.escala}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(info.data).toLocaleDateString("pt-BR")}
                </div>
                {info.hora && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {info.hora}
                  </div>
                )}
                {info.local && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {info.local}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-purple-200 pt-3">
              <p className="text-sm text-gray-600">Função</p>
              <p className="font-semibold text-gray-900">{info.funcao}</p>
            </div>

            {info.descricao && (
              <div className="border-t border-purple-200 pt-3">
                <p className="text-sm text-gray-600 mb-1">Descrição</p>
                <p className="text-sm text-gray-700">{info.descricao}</p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleConfirmar} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={confirmarMutation.isPending}
          >
            {confirmarMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Presença
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Ao confirmar, você está comprometendo-se a participar desta escala.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
