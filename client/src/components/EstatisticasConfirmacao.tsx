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
    <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Users className="w-5 h-5 text-purple-400" />
          Status de Confirmação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-white">
            <span>Progresso de Confirmações</span>
            <span className="text-purple-400">{porcentagemConfirmados}%</span>
          </div>
          <div className="w-full h-4 bg-slate-800/50 rounded-full overflow-hidden border border-purple-500/20">
            <div className="h-full flex">
              {/* Confirmados - Roxo */}
              {porcentagemConfirmados > 0 && (
                <div
                  className="bg-purple-500 transition-all duration-500"
                  style={{ width: `${porcentagemConfirmados}%` }}
                  title={`${confirmados.length} confirmados`}
                />
              )}
              {/* Pendentes - Rosa */}
              {porcentagemPendentes > 0 && (
                <div
                  className="bg-pink-500 transition-all duration-500"
                  style={{ width: `${porcentagemPendentes}%` }}
                  title={`${pendentes.length} pendentes`}
                />
              )}
              {/* Ausentes - Cinza */}
              {porcentagemAusentes > 0 && (
                <div
                  className="bg-slate-600 transition-all duration-500"
                  style={{ width: `${porcentagemAusentes}%` }}
                  title={`${ausentes.length} ausentes`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          {/* Confirmados - Roxo */}
          <div className="bg-purple-900/30 rounded-lg p-3 border-2 border-purple-500/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-200">Confirmados</span>
            </div>
            <div className="text-2xl font-bold text-purple-300">{confirmados.length}</div>
            <div className="text-xs text-purple-400">{porcentagemConfirmados}% do total</div>
          </div>

          {/* Pendentes - Rosa */}
          <div className="bg-pink-900/30 rounded-lg p-3 border-2 border-pink-500/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-medium text-pink-200">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-pink-300">{pendentes.length}</div>
            <div className="text-xs text-pink-400">{porcentagemPendentes}% do total</div>
          </div>

          {/* Ausentes - Cinza */}
          <div className="bg-slate-800/30 rounded-lg p-3 border-2 border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Ausentes</span>
            </div>
            <div className="text-2xl font-bold text-slate-300">{ausentes.length}</div>
            <div className="text-xs text-slate-400">{porcentagemAusentes}% do total</div>
          </div>
        </div>

        {/* Listas Detalhadas */}
        <div className="space-y-3 mt-4">
          {/* Confirmados - Roxo */}
          {confirmados.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirmados ({confirmados.length})
              </h4>
              <div className="space-y-1">
                {confirmados.map(p => (
                  <div key={p.id} className="text-sm bg-purple-900/30 px-3 py-2 rounded border border-purple-500/30 backdrop-blur-sm">
                    <span className="font-medium text-purple-100">{p.nome}</span>
                    {p.funcao && <span className="text-purple-300 ml-2">• {p.funcao.nome}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendentes - Rosa */}
          {pendentes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-pink-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Aguardando Confirmação ({pendentes.length})
              </h4>
              <div className="space-y-1">
                {pendentes.map(p => (
                  <div key={p.id} className="text-sm bg-pink-900/30 px-3 py-2 rounded border border-pink-500/30 backdrop-blur-sm">
                    <span className="font-medium text-pink-100">{p.nome}</span>
                    {p.funcao && <span className="text-pink-300 ml-2">• {p.funcao.nome}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ausentes - Cinza */}
          {ausentes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Ausentes ({ausentes.length})
              </h4>
              <div className="space-y-1">
                {ausentes.map(p => (
                  <div key={p.id} className="text-sm bg-slate-800/30 px-3 py-2 rounded border border-slate-600/30 backdrop-blur-sm">
                    <span className="font-medium text-slate-100">{p.nome}</span>
                    {p.funcao && <span className="text-slate-300 ml-2">• {p.funcao.nome}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mensagem quando não há participantes */}
        {total === 0 && (
          <div className="text-center py-8 text-purple-300">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum participante adicionado ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
