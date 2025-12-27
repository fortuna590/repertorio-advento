/**
 * Templates de Repertórios Pré-configurados
 * Baseados nos tempos litúrgicos para agilizar a montagem
 */

export interface TemplateRepertorio {
  id: string;
  nome: string;
  descricao: string;
  tempoLiturgico: string;
  cor: string;
  emoji: string;
  musicasSelecionadas: string[];
}

export const templatesRepertorio: TemplateRepertorio[] = [
  {
    id: "advento-completo",
    nome: "Advento - Repertório Completo",
    descricao: "Repertório completo para celebrações do Tempo do Advento com músicas de preparação para o Natal",
    tempoLiturgico: "Advento",
    cor: "purple",
    emoji: "🕯️",
    musicasSelecionadas: [
      // Entrada
      "entrada-1", // Teu Povo Espera
      "entrada-2", // Vigia Esperando a Aurora
      
      // Acendimento da Vela
      "acendimento-da-vela-do-advento-1", // Senhor, Nós Te Esperamos
      
      // Ato Penitencial
      "ato-penitencial-1", // Ato Penitencial 1
      
      // Glória (não se canta no Advento, exceto na Solenidade do Natal)
      
      // Aclamação ao Evangelho
      "aclamacao-ao-evangelho-1", // Aclamação ao Evangelho (Advento)
      "aclamacao-ao-evangelho-2", // Aclamação do Evangelho
      
      // Ofertório
      "ofertorio-1", // Do Céu Vai Descer o Cordeiro
      "ofertorio-2", // Busco o Seu Rosto
      
      // Santo
      "santo-1", // Santo Deus do Universo
      
      // Cordeiro
      "cordeiro-1", // Cordeiro 1
      
      // Comunhão
      "comunhao-1", // As Colinas Vão Ser Abaixadas
      "comunhao-2", // Venho, Senhor (Te Receber Agora)
      
      // Final
      "final-1", // Novo Amanhecer
    ]
  },
  {
    id: "missa-do-galo",
    nome: "Missa do Galo - Natal",
    descricao: "Repertório tradicional para a Missa do Galo (Missa da Noite de Natal) com cantos natalinos clássicos",
    tempoLiturgico: "Natal",
    cor: "orange",
    emoji: "🎄",
    musicasSelecionadas: [
      // Entrada
      "missa-galo-entrada-1", // Cristãos, Vinde Todos (Adeste Fideles)
      
      // Ato Penitencial
      "missa-galo-ato-penitencial-1", // Senhor, que viestes salvar
      
      // Glória
      "missa-galo-gloria-1", // Glória a Deus nas Alturas
      
      // Salmo Responsorial
      "missa-galo-salmo-responsorial-1", // Hoje nasceu para nós o Salvador
      
      // Aclamação ao Evangelho
      "missa-galo-aclamacao-ao-evangelho-1", // Aleluia – Hoje nasceu o Salvador
      
      // Ofertório
      "missa-galo-ofertorio-1", // Bendito sejas, ó Deus Criador
      
      // Santo
      "missa-galo-santo-1", // Santo – Missa de Natal (CNBB)
      
      // Cordeiro
      "missa-galo-cordeiro-de-deus-1", // Cordeiro de Deus – Missa de Natal
      
      // Comunhão
      "missa-galo-comunhao-1", // Ó Menino Jesus
      
      // Final
      "missa-galo-final-1", // Noite Feliz
    ]
  },
  {
    id: "tempo-do-natal",
    nome: "Tempo do Natal - Sagrada Família",
    descricao: "Repertório para celebrações do Tempo do Natal, especialmente para a Festa da Sagrada Família",
    tempoLiturgico: "Natal",
    cor: "cyan",
    emoji: "⭐",
    musicasSelecionadas: [
      // Entrada
      "tempo-natal-entrada-1", // Olhando a Sagrada Família
      
      // Ato Penitencial
      "tempo-natal-ato-penitencial-2", // Senhor que Viestes Salvar
      
      // Glória
      "tempo-natal-glória-3", // Glória a Deus nas Alturas
      
      // Aclamação ao Evangelho
      "tempo-natal-aclamação-ao-evangelho-4", // O Cristo Já Nasceu (Na Gruta de Belém)
      
      // Ofertório
      "tempo-natal-ofertório-5", // A Mesa Santa
      
      // Santo
      "tempo-natal-santo-6", // Santo - Deus do Universo
      
      // Cordeiro
      "tempo-natal-cordeiro-de-deus-7", // Cordeiro
      
      // Comunhão
      "tempo-natal-comunhão-8", // Venho Senhor
      "tempo-natal-comunhão-9", // Entre Nós
      
      // Final
      "tempo-natal-final-10", // A Escolhida
    ]
  },
  {
    id: "advento-minimalista",
    nome: "Advento - Essencial",
    descricao: "Repertório minimalista com apenas as músicas essenciais para uma celebração do Advento",
    tempoLiturgico: "Advento",
    cor: "purple",
    emoji: "🕯️",
    musicasSelecionadas: [
      "entrada-1", // Teu Povo Espera
      "acendimento-da-vela-do-advento-1", // Senhor, Nós Te Esperamos
      "ato-penitencial-1", // Ato Penitencial 1
      "aclamacao-ao-evangelho-1", // Aclamação ao Evangelho (Advento)
      "ofertorio-1", // Do Céu Vai Descer o Cordeiro
      "santo-1", // Santo Deus do Universo
      "cordeiro-1", // Cordeiro 1
      "comunhao-1", // As Colinas Vão Ser Abaixadas
      "final-1", // Novo Amanhecer
    ]
  }
];

/**
 * Buscar template por ID
 */
export function getTemplateById(id: string): TemplateRepertorio | undefined {
  return templatesRepertorio.find(t => t.id === id);
}

/**
 * Buscar templates por tempo litúrgico
 */
export function getTemplatesByTempoLiturgico(tempo: string): TemplateRepertorio[] {
  return templatesRepertorio.filter(t => t.tempoLiturgico === tempo);
}
