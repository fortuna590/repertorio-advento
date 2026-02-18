import { repertorio as momentosAdvento } from "./repertorio";
import { momentosQuaresma } from "./momentosQuaresma";

export interface RepertorioBase {
  id: string;
  titulo: string;
  descricao: string;
  momentos: typeof momentosAdvento;
}

export const repertoriosBase: RepertorioBase[] = [
  {
    id: "advento",
    titulo: "Advento",
    descricao: "Repertório litúrgico para o tempo do Advento",
    momentos: momentosAdvento,
  },
  {
    id: "quaresma",
    titulo: "Quaresma",
    descricao: "Repertório litúrgico para o tempo da Quaresma",
    momentos: momentosQuaresma,
  },
  {
    id: "pascoa",
    titulo: "Páscoa",
    descricao: "Repertório litúrgico para o tempo Pascal",
    momentos: [], // Será preenchido futuramente
  },
  {
    id: "natal",
    titulo: "Natal",
    descricao: "Repertório litúrgico para o tempo do Natal",
    momentos: [], // Será preenchido futuramente
  },
  {
    id: "tempo-comum",
    titulo: "Tempo Comum",
    descricao: "Repertório litúrgico para o Tempo Comum",
    momentos: [], // Será preenchido futuramente
  },
  {
    id: "especiais",
    titulo: "Celebrações Especiais",
    descricao: "Repertório para celebrações especiais",
    momentos: [], // Será preenchido futuramente
  },
  {
    id: "maria",
    titulo: "Celebrações Marianas",
    descricao: "Repertório para celebrações marianas",
    momentos: [], // Será preenchido futuramente
  },
];
