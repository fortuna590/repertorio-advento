import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/trpc/products.seed';

async function seedProducts() {
  try {
    console.log('🌱 Iniciando seed de produtos...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    console.log('✅ Resposta:', data);
    
    if (data.result?.data?.success) {
      console.log('✅ Produtos adicionados com sucesso!');
    } else {
      console.log('❌ Erro ao adicionar produtos:', data);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

seedProducts();
