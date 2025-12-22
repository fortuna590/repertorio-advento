'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BookOpen, ExternalLink, AlertCircle, Mail } from "lucide-react";
import { APP_LOGO } from "@/const";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";
import { trpc } from "@/lib/trpc";

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal?: number;
  desconto?: number;
  plataforma: string;
  linkAfiliado: string;
  disponivel: boolean;
  parcelaMaxima?: number;
  valorParcela?: number;
  temJuros?: boolean;
  freteGratis?: boolean;
  cupom?: string;
  valorCupom?: number;
}

export default function Loja() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar produtos da API
  const { data: produtosData } = trpc.products.getAll.useQuery();

  useEffect(() => {
    if (produtosData) {
      // Converter dados do banco para formato da página
      const produtosFormatados = produtosData.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco / 100,
        precoOriginal: p.precoOriginal ? p.precoOriginal / 100 : undefined,
        desconto: p.desconto || undefined,
        plataforma: p.plataforma,
        linkAfiliado: p.linkAfiliado,
        disponivel: p.disponivel === 1,
        parcelaMaxima: p.parcelaMaxima,
        valorParcela: p.valorParcela ? p.valorParcela / 100 : undefined,
        temJuros: p.temJuros === 1,
        freteGratis: p.freteGratis === 1,
        cupom: p.cupom,
        valorCupom: p.valorCupom ? p.valorCupom / 100 : undefined,
      }));
      setProdutos(produtosFormatados);
      setLoading(false);
    }
  }, [produtosData]);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const produtosDisponiveis = produtos.filter(p => p.disponivel);
  const produtosIndisponiveis = produtos.filter(p => !p.disponivel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Loja LouvaMais</h1>
          <p className="text-xl text-purple-200">
            Produtos recomendados para enriquecer seu ministério de música litúrgica
          </p>
        </div>

        {/* Produtos Disponíveis */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-purple-200">Carregando produtos...</p>
          </div>
        ) : produtosDisponiveis.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {produtosDisponiveis.map((produto) => (
              <Card
                key={produto.id}
                className="bg-slate-800 border-purple-500 border-opacity-20 hover:border-opacity-50 transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                    <span className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full">
                      {produto.plataforma === 'mercado_livre' ? 'Mercado Livre' : 'Amazon'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{produto.nome}</h3>
                  <p className="text-purple-200 text-sm mb-4">{produto.descricao}</p>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-3xl font-bold text-purple-400">{formatarPreco(produto.preco)}</p>
                      {produto.precoOriginal && produto.desconto && (
                        <>
                          <p className="text-lg text-purple-300 line-through">{formatarPreco(produto.precoOriginal)}</p>
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">{produto.desconto}% OFF</span>
                        </>
                      )}
                    </div>
                    {produto.parcelaMaxima && produto.parcelaMaxima > 1 && (
                      <p className="text-sm text-purple-200">
                        ou {produto.parcelaMaxima}x de {formatarPreco(produto.valorParcela || 0)} {produto.temJuros ? 'com juros' : 'sem juros'}
                      </p>
                    )}
                    {produto.freteGratis && (
                      <p className="text-sm text-green-400 font-semibold">Frete Gratis</p>
                    )}
                    {produto.cupom && (
                      <p className="text-sm text-yellow-400">Cupom: {produto.cupom}</p>
                    )}
                  </div>
                  <a
                    href={produto.linkAfiliado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Comprar Agora
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-16">
            <p className="text-purple-200">Nenhum produto disponível no momento.</p>
          </div>
        )}

        {/* Por que comprar conosco */}
        <div className="bg-slate-800 border border-purple-500 border-opacity-20 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Por que comprar conosco?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Plataformas Seguras</h3>
                <p className="text-purple-200">
                  Todos os produtos oferecidos são de plataformas seguras como Mercado Livre e Amazon. A garantia da venda é dada pela plataforma responsável, garantindo sua segurança e confiabilidade.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Produtos Reais</h3>
                <p className="text-purple-200">
                  Oferecemos apenas produtos reais e de qualidade, selecionados especialmente para enriquecer seu ministério litúrgico e formação religiosa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos Indisponíveis */}
        {produtosIndisponiveis.length > 0 && (
          <div className="bg-slate-800 border border-yellow-500 border-opacity-20 rounded-lg p-8 mb-16">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Produtos em Breve</h3>
                <p className="text-purple-200 mb-4">
                  Os seguintes produtos estão temporariamente indisponíveis. Entre em contato conosco para saber quando estarão disponíveis novamente.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {produtosIndisponiveis.map((produto) => (
                <div key={produto.id} className="text-purple-200">
                  <p className="font-semibold">{produto.nome}</p>
                  <p className="text-sm text-purple-300">{produto.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Dúvidas sobre os produtos?</h2>
          <p className="text-purple-100 mb-6">
            Entre em contato conosco para mais informações sobre qualquer um dos nossos produtos.
          </p>
          <a
            href="mailto:contato@louvamais.com"
            className="inline-flex items-center bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-purple-50 transition-all"
          >
            <Mail className="w-5 h-5 mr-2" />
            Enviar Email
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-purple-500 border-opacity-10 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={APP_LOGO} alt="LouvaMais" className="h-12 mb-4" />
              <p className="text-purple-200 text-sm">
                LouvaMais para Sua Comunidade
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Navegação</h4>
              <ul className="space-y-2 text-purple-200 text-sm">
                <li><a href="/" className="hover:text-white transition-colors">Início</a></li>
                <li><a href="/repertorio" className="hover:text-white transition-colors">Repertório</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/sobre" className="hover:text-white transition-colors">Sobre</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-purple-200 text-sm">
                <li><a href="/contato" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="/loja" className="hover:text-white transition-colors">Loja</a></li>
                <li><a href="/sobre" className="hover:text-white transition-colors">Sobre Nós</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
              <SocialLinks />
            </div>
          </div>
          <div className="border-t border-purple-500 border-opacity-10 pt-8 text-center text-purple-200 text-sm">
            <p>&copy; 2025 LouvaMais. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
