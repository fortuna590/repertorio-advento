import EmBreve from "@/components/EmBreve";
import { PartyPopper } from "lucide-react";

export default function RepertorioCelebracoes() {
  return (
    <EmBreve
      titulo="Celebrações Especiais"
      descricao="Repertório para Domingo de Ramos, Tríduo Pascal, Pentecostes e outras solenidades"
      icone={PartyPopper}
      cor="vermelho"
    />
  );
}
