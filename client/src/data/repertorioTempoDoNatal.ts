export interface Musica {
  id: string;
  titulo: string;
  momento: string;
  tom: string;
  cifraResumo: string;
  linkCifra: string;
  linkYoutube?: string;
}

export const repertorioTempoDoNatal: Musica[] = [
  {
    id: "1",
    titulo: "Olhando a Sagrada Família",
    momento: "Entrada",
    tom: "G",
    cifraResumo: "G D Em C | D G C D",
    linkCifra: "https://www.cifraclub.com.br/catolicas/olhando-a-sagrada-familia/",
    linkYoutube: ""
  },
  {
    id: "2",
    titulo: "Senhor que Viestes Salvar",
    momento: "Ato Penitencial",
    tom: "F",
    cifraResumo: "F C Dm Bb | C F Bb C",
    linkCifra: "https://www.cifraclub.com.br/catolicas/senhor-que-viestes-salvar/#key=5",
    linkYoutube: ""
  },
  {
    id: "3",
    titulo: "Glória a Deus nas Alturas",
    momento: "Glória",
    tom: "C",
    cifraResumo: "C G Am F | G C F G",
    linkCifra: "https://www.cifraclub.com.br/frei-gilson/gloria-a-deus-nas-alturas/",
    linkYoutube: ""
  },
  {
    id: "4",
    titulo: "O Cristo Já Nasceu (Na Gruta de Belém)",
    momento: "Aclamação ao Evangelho",
    tom: "F",
    cifraResumo: "F C Dm Bb | C F Bb C",
    linkCifra: "https://www.cifraclub.com.br/coral-s-j-batista/na-gruta-de-belem/#key=5",
    linkYoutube: ""
  },
  {
    id: "5",
    titulo: "A Mesa Santa",
    momento: "Ofertório",
    tom: "D",
    cifraResumo: "D A Bm G | A D G A",
    linkCifra: "https://www.cifraclub.com.br/catolicas/a-mesa-santa-que-preparamos-845/",
    linkYoutube: ""
  },
  {
    id: "6",
    titulo: "Santo - Deus do Universo",
    momento: "Santo",
    tom: "G",
    cifraResumo: "G D Em C | D G C D",
    linkCifra: "https://www.cifraclub.com.br/catolicas/santo-deus-do-universo/",
    linkYoutube: ""
  },
  {
    id: "7",
    titulo: "Cordeiro",
    momento: "Cordeiro de Deus",
    tom: "C",
    cifraResumo: "C G Am F | G C F G",
    linkCifra: "https://www.cifraclub.com.br/ministerio-amor-e-adoracao/cordeiro/principal.html#instrument=guitar&key=0",
    linkYoutube: ""
  },
  {
    id: "8",
    titulo: "Venho Senhor",
    momento: "Comunhão",
    tom: "A",
    cifraResumo: "A E F#m D | E A D E",
    linkCifra: "https://www.cifraclub.com.br/vida-reluz/venho-senhor/",
    linkYoutube: ""
  },
  {
    id: "9",
    titulo: "Entre Nós",
    momento: "Comunhão",
    tom: "G",
    cifraResumo: "G D Em C | D G C D",
    linkCifra: "https://www.cifraclub.com.br/ministerio-amor-e-adoracao/entre-nos/",
    linkYoutube: ""
  },
  {
    id: "10",
    titulo: "A Escolhida",
    momento: "Final",
    tom: "D",
    cifraResumo: "D A Bm G | A D G A",
    linkCifra: "https://www.cifraclub.com.br/catolicas/a-escolhida/",
    linkYoutube: ""
  }
];
