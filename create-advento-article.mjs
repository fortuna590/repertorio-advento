import { drizzle } from "drizzle-orm/mysql2";
import { artigos } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const artigoAdvento = {
  titulo: "O Advento: Tempo de Espera e Preparação para o Natal",
  slug: "advento-tempo-espera-preparacao-natal",
  resumo: "Descubra o significado profundo do Advento, a importância de viver a espera do Senhor e como as quatro velas nos guiam nessa jornada espiritual de preparação para o Natal.",
  conteudo: `O Advento é um dos tempos litúrgicos mais ricos e significativos do ano cristão. Derivado do latim "adventus", que significa "chegada" ou "vinda", este período de aproximadamente quatro semanas nos convida a uma profunda preparação espiritual para celebrar o nascimento de Jesus Cristo e, ao mesmo tempo, aguardar sua segunda vinda gloriosa.

**A Importância de Viver a Espera do Senhor**

Vivemos em uma sociedade marcada pela pressa, pela ansiedade e pela busca incessante por resultados imediatos. O Advento nos convida a uma contracorrente: aprender a esperar. Mas não se trata de uma espera passiva ou vazia. É uma espera ativa, cheia de esperança, oração e conversão.

A espera do Advento nos ensina que Deus age em seu tempo, não no nosso. Ela nos convida a cultivar a paciência, a confiança e a fé de que o Senhor virá ao nosso encontro. Como o povo de Israel aguardou durante séculos a vinda do Messias, também nós somos chamados a viver na expectativa vigilante da presença de Deus em nossas vidas.

Esta espera não é um tempo perdido, mas um tempo de crescimento interior. É o momento de preparar nosso coração, como quem prepara uma casa para receber um hóspede muito especial. Precisamos limpar o que está sujo, organizar o que está em desordem e adornar com amor aquilo que receberá o Senhor.

**O Significado Profundo das Quatro Velas**

A Coroa do Advento, com suas quatro velas, é um dos símbolos mais conhecidos deste tempo litúrgico. Cada vela acesa representa uma semana de preparação e carrega um significado especial:

**Primeira Vela - A Esperança:** Tradicionalmente roxa, esta vela nos lembra da esperança que o povo de Israel manteve viva durante séculos, aguardando o Messias prometido. Ela nos convida a renovar nossa esperança em Deus, mesmo diante das dificuldades e incertezas da vida.

**Segunda Vela - A Fé:** Também roxa, esta vela representa a fé dos patriarcas e profetas que acreditaram nas promessas de Deus. Ela nos desafia a fortalecer nossa fé, confiando que Deus é fiel e cumpre suas promessas.

**Terceira Vela - A Alegria:** Diferente das outras, esta vela é rosa e é acesa no terceiro domingo do Advento, chamado "Domingo Gaudete" (alegrai-vos). Ela marca o meio do caminho e nos lembra que a chegada do Salvador está próxima. É um convite à alegria que brota da certeza de que Deus está vindo.

**Quarta Vela - A Paz:** A última vela roxa simboliza a paz que o Príncipe da Paz trará ao mundo. Ela nos convida a ser instrumentos de paz em nossos ambientes, preparando o caminho para que Cristo nasça nos corações.

O círculo da coroa, sem início nem fim, representa a eternidade de Deus e seu amor infinito por nós. Os ramos verdes simbolizam a esperança e a vida eterna que Cristo nos traz.

**A Preparação: Mais que Decorações e Presentes**

Em meio à correria das compras de Natal, decorações e festas, o Advento nos convida a uma preparação de natureza diferente. Trata-se de uma preparação interior, espiritual, que transforma nosso coração.

**1. Oração e Silêncio:** O Advento é tempo de intensificar nossa vida de oração. Precisamos criar espaços de silêncio em nossa rotina para ouvir a voz de Deus. A oração nos ajuda a discernir o que realmente importa e a nos desapegarmos do supérfluo.

**2. Penitência e Conversão:** Este tempo nos convida a olhar para dentro e reconhecer nossas falhas, pecados e áreas que precisam de conversão. A cor roxa das vestes litúrgicas nos lembra deste aspecto penitencial. É momento de buscar o sacramento da Reconciliação e renovar nosso compromisso com Deus.

**3. Caridade e Solidariedade:** Preparar-se para o Natal é também preparar-se para acolher Jesus nos mais necessitados. O Advento nos desafia a praticar obras de misericórdia, compartilhar o que temos e ser presença de amor para quem sofre.

**4. Simplicidade e Desapego:** Enquanto o mundo nos empurra para o consumismo desenfreado, o Advento nos convida à simplicidade. Que tal um Natal mais simples, mais autêntico, mais centrado em Cristo?

**A Música Litúrgica no Advento**

A música tem um papel fundamental na vivência do Advento. Os cantos deste tempo litúrgico nos ajudam a entrar no mistério da espera e da preparação. Músicas como "Vem, Senhor Jesus", "Preparai o Caminho do Senhor" e "Maranathá" nos colocam em atitude de súplica e expectativa.

É importante respeitar o tempo litúrgico e evitar cantar músicas natalinas antes do Natal. O Advento tem sua própria riqueza musical que precisa ser valorizada. Os cantos de Advento nos ajudam a viver a espiritualidade própria deste tempo, diferente da alegria exuberante do Natal.

**Conclusão: Um Convite à Vigilância**

O Advento nos convida a viver vigilantes, como as virgens prudentes da parábola evangélica, que mantiveram suas lâmpadas acesas aguardando o esposo. Vigilância não é ansiedade, mas atenção amorosa, prontidão do coração, disposição para acolher o Senhor quando Ele vier.

Que possamos viver este Advento não apenas como uma contagem regressiva para o Natal, mas como um verdadeiro tempo de graça, de conversão e de encontro com o Deus que vem ao nosso encontro. Que as quatro velas da Coroa do Advento iluminem nosso caminho e nos guiem até a manjedoura de Belém, onde encontraremos o Emanuel, o Deus-conosco.

Maranathá! Vem, Senhor Jesus!`,
  imagemCapa: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&h=600&fit=crop",
  categoria: "Advento",
  tags: JSON.stringify(["Advento", "Liturgia", "Espiritualidade", "Natal", "Preparação"]),
  autorNome: "LouvaMais - Church Solutions",
  publicado: 1,
  visualizacoes: 0,
};

try {
  const result = await db.insert(artigos).values(artigoAdvento);
  console.log("✅ Artigo sobre o Advento criado com sucesso!");
  console.log("ID:", result[0].insertId);
  console.log("Acesse: /blog/advento-tempo-espera-preparacao-natal");
  process.exit(0);
} catch (error) {
  console.error("❌ Erro ao criar artigo:", error);
  process.exit(1);
}
