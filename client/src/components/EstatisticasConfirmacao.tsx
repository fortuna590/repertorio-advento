import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Users } from "lucide-react";

interface Participante {
  id: number;
  nome: string;
  status: string;
  funcao?: {
    nome: string;
  };
}

interface EstatisticasConfirmacaoProps {
  participantes: Participante[];
}

export function EstatisticasConfirmacao({ participantes }: EstatisticasConfirmacaoProps) {
  const confirmados = participantes.filter(p => p.status === "confirmado");
  const pendentes = participantes.filter(p => p.status === "pendente");
  const ausentes = participantes.filter(p => p.status === "ausente");

  const total = participantes.length;
  const porcentagemConfirmados = total > 0 ? Math.round((confirmados.length / total) * 100) : 0;
  const porcentagemPendentes = total > 0 ? Math.round((pendentes.length / total) * 100) : 0;
  const porcentagemAusentes = total > 0 ? Math.round((ausentes.length / total) * 100) : 0;

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-purple-600" />
          Status de Confirmação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Progresso de Confirmações</span>
            <span className="text-purple-600">{porcentagemConfirmados}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full flex">
              {/* Confirmados */}
              {porcentagemConfirmados > 0 && (
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${porcentagemConfirmados}%` }}
                  title={`${confirmados.length} confirmados`}
                />
              )}
              {/* Ausentes */}
              {porcentagemAusentes > 0 && (
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${porcentagemAusentes}%` }}
                  title={`${ausentes.length} ausentes`}
                />
              )}
              {/* Pendentes */}
              {porcentagemPendentes > 0 && (
                <div
                  className="bg-yellow-500 transition-all duration-500"
                  style={{ width: `${porcentagemPendentes}%` }}
                  title={`${pendentes.length} pendentes`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          {/* Confirmados */}
          <div className="bg-white rounded-lg p-3 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Confirmados</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{confirmados.length}</div>
            <div className="text-xs text-gray-500">{porcentagemConfirmados}% do total</div>
          </div>

          {/* Pendentes */}
          <div className="bg-white rounded-lg p-3 border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-gray-600">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{pendentes.length}</div>
            <div className="text-xs text-gray-500">{porcentagemPendentes}% do total</div>
          </div>

          {/* Ausentes */}
          <div className="bg-white rounded-lg p-3 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-gray-600">Ausentes</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{ausentes.length}</div>
            <div className="text-xs text-gray-500">{porcentagemAusentes}% do total</div>
          </div>
        </div>

        {/* Listas Detalhadas */}
        <div className="space-y-3 mt-4">
          {/* Confirmados */}
          {confirmados.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirmados ({confirmados.length})
              </h4>
              <div className="space-y-1">
                {confirmados.map(p => (
                  <div key={p.id} className="text-sm bg-green-50 px-3 py-2 rounded border border-green-200">
                    <span className="font-medium">{p.nome}</span>
                    {p.funcao && <span className="text-gray-600 ml-2">• {p.funcao.nome}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendentes */}
          {pendentes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Aguardando Confirmação ({pendentes.length})
              </h4>
              <div className="space-y-1">
                {pendentes.map(p => (
                  <div key={p.id} className="text-sm bg-yellow-50 px-3 py-2 rounded border border-yellow-200">
                    <span className="font-medium">{p.nome}</span>
                    {p.funcao && <span className="text-gray-600 ml-2">• {p.funcao.nome}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ausentes */}
          {ausentes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Ausentes ({ausentes.length})
              </h4>
              <div className="space-y-1">
                {ausentes.map(p => (
                  <div key={p.id} className="text-sm bg-red-50 px-3 py-2 rounded border border-red-200">
                    <span className="font-medium">{p.nome}</span>
                    {p.funcao && <span className="text-gray-600 ml-2">• {p.funcao.nome}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mensagem quando não há participantes */}
        {total === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum participante adicionado ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
