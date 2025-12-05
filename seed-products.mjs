import { db } from './server/db.ts';
import { products } from './drizzle/schema.ts';

const seedProducts = async () => {
  try {
    // Limpar produtos existentes
    await db.delete(products);

    // Adicionar novos produtos
    const newProducts = [
      {
        title: 'Catecismo da Igreja Católica',
        description: 'Compêndio oficial da doutrina católica',
        price: 299.90,
        platform: 'mercado-livre',
        platformId: '5NTWJH-B1NV',
        affiliateUrl: 'https://mercadolivre.com/sec/1L32bE3',
        active: true,
      },
      {
        title: 'Missal Romano - Tradução Da 3ª Edição Típica',
        description: 'Missal Solene para celebração da Santa Missa',
        price: 579.89,
        platform: 'mercado-livre',
        platformId: '5NTWJH-XHZD',
        affiliateUrl: 'https://mercadolivre.com/sec/2uS2z1T',
        active: true,
      },
      {
        title: 'Constituição Sacrosanctum Concilium',
        description: 'Documento do Concílio Vaticano II sobre a Sagrada Liturgia',
        price: 20.00,
        platform: 'mercado-livre',
        platformId: '1ibn8j6',
        affiliateUrl: 'https://mercadolivre.com/sec/1ibn8j6',
        active: true,
      },
      {
        title: 'O Segredo dos Ritos',
        description: 'Ritualidade e sacramentalidade da liturgia cristã - 216 páginas',
        price: 30.40,
        platform: 'amazon',
        platformId: '8535628673',
        affiliateUrl: 'https://amzn.to/3Y5inXF',
        active: true,
      },
      {
        title: 'Cristo, Festa Da Igreja - O Ano Litúrgico',
        description: 'Estudo do ano litúrgico e celebração de Cristo - 506 páginas',
        price: 50.77,
        platform: 'amazon',
        platformId: '8573110392',
        affiliateUrl: 'https://amzn.to/4pOmXFQ',
        active: true,
      },
      {
        title: 'No Espírito E Na Verdade - Volume 2',
        description: 'Introdução Antropológica à Liturgia - 448 páginas',
        price: 0.00,
        platform: 'amazon',
        platformId: '8532616852',
        affiliateUrl: 'https://amzn.to/48QMOaf',
        active: false,
      },
    ];

    for (const product of newProducts) {
      await db.insert(products).values(product);
    }

    console.log('✅ Produtos adicionados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error);
  }
};

seedProducts();
