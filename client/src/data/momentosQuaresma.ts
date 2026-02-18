export interface Musica {
  id?: string;
  numero: number;
  titulo: string;
  artista: string;
  youtube: string;
  cifra: string;
  observacao?: string;
  momento?: string;
}

export interface MomentoMissa {
  id: string;
  numero: string;
  titulo: string;
  musicas: Musica[];
  observacao?: string;
}

export const momentosQuaresma: MomentoMissa[] = [
  {
    id: "entrada",
    numero: "1️⃣",
    titulo: "ENTRADA",
    musicas: [],
  },
  {
    id: "ato-penitencial",
    numero: "2️⃣",
    titulo: "ATO PENITENCIAL",
    musicas: [],
  },
  {
    id: "aclamacao-evangelho",
    numero: "3️⃣",
    titulo: "ACLAMAÇÃO AO EVANGELHO",
    musicas: [],
  },
  {
    id: "ofertorio",
    numero: "4️⃣",
    titulo: "OFERTÓRIO",
    musicas: [],
  },
  {
    id: "santo",
    numero: "5️⃣",
    titulo: "SANTO",
    musicas: [],
  },
  {
    id: "cordeiro",
    numero: "6️⃣",
    titulo: "CORDEIRO DE DEUS",
    musicas: [],
  },
  {
    id: "comunhao",
    numero: "7️⃣",
    titulo: "COMUNHÃO",
    musicas: [],
  },
  {
    id: "pos-comunhao",
    numero: "8️⃣",
    titulo: "PÓS-COMUNHÃO",
    musicas: [],
  },
  {
    id: "final",
    numero: "9️⃣",
    titulo: "FINAL",
    musicas: [],
  },
];
