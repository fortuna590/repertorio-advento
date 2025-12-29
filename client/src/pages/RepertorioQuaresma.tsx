import EmBreve from "@/components/EmBreve";
import { Cross } from "lucide-react";

export default function RepertorioQuaresma() {
  return (
    <EmBreve
      titulo="Tempo da Quaresma"
      descricao="Repertório para o tempo de conversão, penitência e preparação para a Páscoa"
      icone={Cross}
      cor="roxo"
    />
  );
}
