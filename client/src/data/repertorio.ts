export interface Musica {
  numero: number;
  titulo: string;
  artista: string;
  youtube: string;
  cifra: string;
  observacao?: string;
}

export interface MomentoMissa {
  id: string;
  numero: string;
  titulo: string;
  musicas: Musica[];
  observacao?: string;
}

export const repertorio: MomentoMissa[] = [
  {
    id: "entrada",
    numero: "1️⃣",
    titulo: "ENTRADA",
    musicas: [
      {
        numero: 1,
        titulo: "Teu Povo Espera",
        artista: "Marcus Vinícius Lima",
        youtube: "https://www.youtube.com/watch?v=y0om9ChK1Fk",
        cifra: "https://www.cifraclub.com.br/marcus-vinicius-lima/teu-povo-espera/"
      },
      {
        numero: 2,
        titulo: "Vigia Esperando a Aurora",
        artista: "Monsenhor Jonas Abib",
        youtube: "https://www.youtube.com/watch?v=Rz-viw1PVbc",
        cifra: "https://www.cifraclub.com.br/padre-jonas/vigia-esperando-aurora/"
      },
      {
        numero: 3,
        titulo: "O Senhor Está Pra Chegar",
        artista: "Ministério Renovai",
        youtube: "https://youtube.com/watch?v=lxsaEx8FZgY",
        cifra: "https://www.cifraclub.com.br/ministerio-renovai/o-senhor-esta-pra-chegar/"
      },
      {
        numero: 4,
        titulo: "Senhor, Vem Salvar Teu Povo",
        artista: "CNBB",
        youtube: "https://www.youtube.com/watch?v=NRrbn3-1W7M",
        cifra: "https://www.cifraclub.com.br/catolicas/senhor-vem-salvar-teu-povo/"
      }
    ]
  },
  {
    id: "acendimento",
    numero: "3️⃣",
    titulo: "ACENDIMENTO DA VELA DO ADVENTO",
    musicas: [
      {
        numero: 1,
        titulo: "Senhor, Nós Te Esperamos",
        artista: "Músicas Católicas",
        youtube: "https://youtu.be/dW5XezK5sYM",
        cifra: "https://www.cifraclub.com.br/catolicas/senhor-nos-te-esperamos/"
      }
    ]
  },
  {
    id: "penitencial",
    numero: "4️⃣",
    titulo: "ATO PENITENCIAL",
    musicas: [
      {
        numero: 1,
        titulo: "Ato Penitencial 1",
        artista: "Marcus Vinícius Lima",
        youtube: "https://www.youtube.com/watch?v=jI02itZ06rM",
        cifra: "https://www.cifraclub.com.br/marcus-vinicius-lima/"
      },
      {
        numero: 2,
        titulo: "Senhor que Vindes Visitar Vosso Povo",
        artista: "Edson Lopes",
        youtube: "https://www.youtube.com/watch?v=Ap80vMh2gcU",
        cifra: "https://www.cifraclub.com.br/catolicas/senhor-que-vindes-visitar/"
      },
      {
        numero: 3,
        titulo: "Ato Penitencial 2",
        artista: "Marcus Vinícius Lima",
        youtube: "https://www.youtube.com/watch?v=2GcFDjkei5Y",
        cifra: "https://www.cifraclub.com.br/marcus-vinicius-lima/"
      }
    ]
  },
  {
    id: "gloria",
    numero: "5️⃣",
    titulo: "HINO DE LOUVOR (GLÓRIA)",
    observacao: "Somente se canta na Missa da Solenidade do Natal",
    musicas: [
      {
        numero: 1,
        titulo: "Glória",
        artista: "Canção Nova",
        youtube: "https://www.youtube.com/watch?v=dQ3EQWat9-I",
        cifra: ""
      }
    ]
  },
  {
    id: "aclamacao",
    numero: "7️⃣",
    titulo: "ACLAMAÇÃO AO EVANGELHO",
    musicas: [
      {
        numero: 1,
        titulo: "Aclamação ao Evangelho (Advento)",
        artista: "CNBB",
        youtube: "https://www.youtube.com/watch?v=WMVLsOlDuak",
        cifra: "https://www.cifraclub.com.br/cnbb/aclamacao-ao-evangelho-advento/"
      },
      {
        numero: 2,
        titulo: "Aclamação do Evangelho",
        artista: "Marcus Vinícius Lima",
        youtube: "https://www.youtube.com/watch?v=nz6jJ3omw8w",
        cifra: "https://www.cifraclub.com.br/marcus-vinicius-lima/"
      },
      {
        numero: 3,
        titulo: "Como o Sol Nasce da Aurora",
        artista: "Músicas Litúrgicas",
        youtube: "https://www.youtube.com/watch?v=Tw3HJ2T4tXE",
        cifra: "https://www.cifraclub.com.br/musicas-liturgicas/como-o-sol-nasce-da-aurora/"
      },
      {
        numero: 4,
        titulo: "Que as Nuvens Se Abram",
        artista: "Músicas Litúrgicas",
        youtube: "https://www.youtube.com/watch?v=xAOM54EXxiA",
        cifra: "https://www.cifraclub.com.br/catolicas/que-as-nuvens-se-abram/"
      }
    ]
  },
  {
    id: "ofertorio",
    numero: "8️⃣",
    titulo: "OFERTÓRIO",
    musicas: [
      {
        numero: 1,
        titulo: "Do Céu Vai Descer o Cordeiro",
        artista: "Ministério Gratia Plena",
        youtube: "https://www.youtube.com/watch?v=6msMCMurgNU",
        cifra: "https://www.cifraclub.com.br/ministerio-gratia-plena/do-ceu-vai-descer-o-cordeiro/"
      },
      {
        numero: 2,
        titulo: "Busco o Seu Rosto",
        artista: "Marcus Vinícius Lima",
        youtube: "https://www.youtube.com/watch?v=0bt1g9bMkvg",
        cifra: "https://www.cifraclub.com.br/marcus-lima/busco-o-seu-rosto/"
      },
      {
        numero: 3,
        titulo: "Oferta de Louvor",
        artista: "Ministério Amor e Adoração",
        youtube: "https://youtu.be/o3OH9Um4M1A",
        cifra: "https://www.cifraclub.com.br/ministerio-amor-e-adoracao/oferta-de-louvor/"
      }
    ]
  },
  {
    id: "santo",
    numero: "9️⃣",
    titulo: "SANTO",
    musicas: [
      {
        numero: 1,
        titulo: "Santo Deus do Universo",
        artista: "Músicas Católicas",
        youtube: "https://youtu.be/ysj8Sub2q2A",
        cifra: "https://www.cifraclub.com.br/catolicas/santo-deus-do-universo/"
      },
      {
        numero: 2,
        titulo: "Santo",
        artista: "Frei Gilson",
        youtube: "https://youtu.be/vNlKzwIrKt4",
        cifra: "https://www.cifraclub.com.br/frei-gilson/santo/"
      },
      {
        numero: 3,
        titulo: "Santo",
        artista: "Ministério Amor e Adoração",
        youtube: "https://youtube.com/watch?v=IDNaLniqc_U",
        cifra: "https://www.cifraclub.com.br/ministerio-amor-e-adoracao/santo/"
      }
    ]
  },
  {
    id: "cordeiro",
    numero: "🔟",
    titulo: "CORDEIRO",
    musicas: [
      {
        numero: 1,
        titulo: "Cordeiro 1",
        artista: "Ministério Amor e Adoração",
        youtube: "https://youtu.be/Gn25Nl7WIFU",
        cifra: "https://www.cifraclub.com.br/ministerio-amor-e-adoracao/cordeiro/"
      },
      {
        numero: 2,
        titulo: "Cordeiro de Deus",
        artista: "Ministério Amor e Adoração",
        youtube: "https://youtu.be/janev45m3K4",
        cifra: "https://www.cifraclub.com.br/ministerio-amor-e-adoracao/cordeiro-de-deus/"
      },
      {
        numero: 3,
        titulo: "Cordeiro",
        artista: "Frei Gilson",
        youtube: "https://youtu.be/DUQ9GwEnlrs",
        cifra: "https://www.cifraclub.com.br/frei-gilson/cordeiro/"
      }
    ]
  },
  {
    id: "comunhao",
    numero: "1️⃣1️⃣",
    titulo: "COMUNHÃO",
    musicas: [
      {
        numero: 1,
        titulo: "As Colinas Vão Ser Abaixadas",
        artista: "Músicas Católicas",
        youtube: "https://www.youtube.com/watch?v=tujUgkTGDAI",
        cifra: "https://www.cifraclub.com.br/catolicas/as-colinas-vao-ser-abaixadas/"
      },
      {
        numero: 2,
        titulo: "Venho, Senhor (Te Receber Agora)",
        artista: "Vida Reluz",
        youtube: "https://www.youtube.com/watch?v=pLtOcWzAEVY",
        cifra: "https://www.cifraclub.com.br/vida-reluz/venho-senhor/"
      },
      {
        numero: 3,
        titulo: "Vimos a sua estrela",
        artista: "Marcus Vinícius Lima",
        youtube: "https://www.youtube.com/watch?v=DG_q0ciUYLU",
        cifra: "https://musicasparamissa.com.br/musica/vimos-a-sua-estrela--marcus-lima/",
        observacao: "Somente se canta na Missa da Epifania do Senhor"
      },
      {
        numero: 4,
        titulo: "Cristãos, Vinde Todos",
        artista: "Músicas Católicas",
        youtube: "https://www.youtube.com/watch?v=m1DwzdpvCEY",
        cifra: "https://www.cifraclub.com.br/catolicas/cristaos-vinde-todos/"
      }
    ]
  },
  {
    id: "final",
    numero: "1️⃣2️⃣",
    titulo: "FINAL",
    musicas: [
      {
        numero: 1,
        titulo: "Novo Amanhecer",
        artista: "Comunidade Católica Shalom",
        youtube: "https://www.youtube.com/watch?v=S51N-U2bGB4",
        cifra: "https://www.cifraclub.com.br/comunidade-catolica-shalom/novo-amanhecer/"
      },
      {
        numero: 2,
        titulo: "Natal é tempo de rever",
        artista: "José Acácio Santana",
        youtube: "https://www.youtube.com/watch?v=OSq5_WCTpVI",
        cifra: ""
      },
      {
        numero: 3,
        titulo: "Vamos Todos a Belém",
        artista: "Músicas Católicas",
        youtube: "",
        cifra: ""
      }
    ]
  }
];
