/**
 * Repertório da Missa do Galo - Natal
 * 10 músicas organizadas por momentos da missa
 */

export interface MusicaMissaDoGalo {
  numero: number;
  titulo: string;
  artista?: string;
  tom: string;
  categoria: string;
  cifraResumo: string;
  cifra?: string;
  youtube?: string;
  observacao?: string;
}

export interface MomentoMissaDoGalo {
  id: string;
  numero: string;
  titulo: string;
  observacao?: string;
  musicas: MusicaMissaDoGalo[];
}

export const repertorioMissaDoGalo: MomentoMissaDoGalo[] = [
  {
    id: "entrada",
    numero: "1",
    titulo: "Entrada",
    musicas: [
      {
        numero: 1,
        titulo: "Cristãos, Vinde Todos (Adeste Fideles)",
        tom: "D",
        categoria: "Tradicional",
        cifraResumo: "D A D | Cristãos, vinde todos...\nG D A | Vede nascido vosso Rei eterno...",
        cifra: "https://www.cifraclub.com.br/catolicas/cristaos-vinde-todos/",
        youtube: "https://www.youtube.com/results?search_query=crist%C3%A3os+vinde+todos+adeste+fideles",
        observacao: "Canto clássico de abertura do Natal"
      }
    ]
  },
  {
    id: "ato-penitencial",
    numero: "2",
    titulo: "Ato Penitencial",
    observacao: "Opcional cantar",
    musicas: [
      {
        numero: 2,
        titulo: "Senhor, que viestes salvar",
        tom: "Am",
        categoria: "Ordinário",
        cifraResumo: "Am Dm | Senhor, que viestes salvar...\nE Am | tende piedade de nós.",
        cifra: "https://www.cifraclub.com.br/catolicas/senhor-que-viestes-salvar/",
        youtube: "https://www.youtube.com/results?search_query=senhor+que+viestes+salvar+canto+liturgico",
        observacao: "Opcional cantar"
      }
    ]
  },
  {
    id: "gloria",
    numero: "3",
    titulo: "Glória",
    observacao: "Obrigatório no Natal",
    musicas: [
      {
        numero: 3,
        titulo: "Glória a Deus nas Alturas",
        tom: "D",
        categoria: "Ordinário – Natal",
        cifraResumo: "D A | Glória a Deus nas alturas...\nG Em A | Senhor Deus, Rei dos céus...",
        cifra: "https://www.cifraclub.com.br/catolicas/gloria-a-deus-nas-alturas/",
        youtube: "https://www.youtube.com/results?search_query=gloria+a+deus+nas+alturas+missa+de+natal",
        observacao: "Obrigatório no Natal"
      }
    ]
  },
  {
    id: "salmo",
    numero: "4",
    titulo: "Salmo Responsorial",
    musicas: [
      {
        numero: 4,
        titulo: "Hoje nasceu para nós o Salvador",
        tom: "F",
        categoria: "Salmo Responsorial",
        cifraResumo: "F C | Hoje nasceu para nós o Salvador...",
        cifra: "https://www.cifraclub.com.br/catolicas/hoje-nasceu-para-nos-o-salvador/",
        youtube: "https://www.youtube.com/results?search_query=hoje+nasceu+para+n%C3%B3s+o+salvador+salmo",
        observacao: "Salmo do Dia"
      }
    ]
  },
  {
    id: "aclamacao",
    numero: "5",
    titulo: "Aclamação ao Evangelho",
    musicas: [
      {
        numero: 5,
        titulo: "Aleluia – Hoje nasceu o Salvador",
        tom: "G",
        categoria: "Aclamação",
        cifraResumo: "G D | Aleluia, aleluia...\nC G D | Hoje nasceu o Salvador!",
        cifra: "https://www.cifraclub.com.br/catolicas/aleluia-hoje-nasceu-o-salvador/",
        youtube: "https://www.youtube.com/results?search_query=aleluia+hoje+nasceu+o+salvador+natal"
      }
    ]
  },
  {
    id: "ofertorio",
    numero: "6",
    titulo: "Ofertório",
    musicas: [
      {
        numero: 6,
        titulo: "Bendito sejas, ó Deus Criador",
        tom: "C",
        categoria: "Ofertório",
        cifraResumo: "C G | Bendito sejas, ó Deus Criador...\nF C Dm G | o pão que agora apresentamos...",
        cifra: "https://www.cifraclub.com.br/catolicas/bendito-sejas-o-deus-criador/",
        youtube: "https://www.youtube.com/results?search_query=bendito+sejas+o+deus+criador+canto+liturgico"
      }
    ]
  },
  {
    id: "santo",
    numero: "7",
    titulo: "Santo",
    musicas: [
      {
        numero: 7,
        titulo: "Santo – Missa de Natal (CNBB)",
        tom: "D",
        categoria: "Ordinário",
        cifraResumo: "D A | Santo, Santo, Santo...\nG D A | Senhor Deus do universo...",
        cifra: "https://www.cifraclub.com.br/catolicas/santo-missa-de-natal/",
        youtube: "https://www.youtube.com/results?search_query=santo+missa+de+natal+cnbb"
      }
    ]
  },
  {
    id: "cordeiro",
    numero: "8",
    titulo: "Cordeiro de Deus",
    musicas: [
      {
        numero: 8,
        titulo: "Cordeiro de Deus – Missa de Natal",
        tom: "D",
        categoria: "Ordinário",
        cifraResumo: "D A | Cordeiro de Deus que tirais...\nG D A D | tende piedade de nós...",
        cifra: "https://www.cifraclub.com.br/catolicas/cordeiro-de-deus-missa-de-natal/",
        youtube: "https://www.youtube.com/results?search_query=cordeiro+de+deus+missa+de+natal"
      }
    ]
  },
  {
    id: "comunhao",
    numero: "9",
    titulo: "Comunhão",
    musicas: [
      {
        numero: 9,
        titulo: "Ó Menino Jesus",
        tom: "G",
        categoria: "Natal",
        cifraResumo: "G D | Ó Menino Jesus...\nC G Am D | sois nosso Salvador...",
        cifra: "https://www.cifraclub.com.br/catolicas/o-menino-jesus/",
        youtube: "https://www.youtube.com/results?search_query=%C3%B3+menino+jesus+canto+natal"
      }
    ]
  },
  {
    id: "final",
    numero: "10",
    titulo: "Final",
    musicas: [
      {
        numero: 10,
        titulo: "Noite Feliz",
        tom: "G",
        categoria: "Tradicional Natalino",
        cifraResumo: "G D | Noite feliz, noite feliz...\nC G Am D G | dorme em paz, ó Jesus!",
        cifra: "https://www.cifraclub.com.br/catolicas/noite-feliz/",
        youtube: "https://www.youtube.com/results?search_query=noite+feliz+canto+cat%C3%B3lico+natal"
      }
    ]
  }
];

export const metadataRepertorioMissaDoGalo = {
  titulo: "Missa do Galo – Natal",
  tempoLiturgico: "Natal",
  descricao: "Repertório tradicional para Missa do Galo",
  criadoPor: "Coral Sagrado",
  dataCriacao: "2025-12-24",
  totalMusicas: 10,
  totalMomentos: 10
};
