# LouvaMais — TODO

## Reconstrução do Zero (MVP)

- [x] Limpar projeto antigo (páginas, componentes, routers, schema)
- [x] Criar novo schema Drizzle (lm_repertorios, lm_musicas, lm_artigos, users)
- [x] Criar tabelas no banco de dados
- [x] Popular banco com 5 repertórios iniciais e artigo do Advento
- [x] Criar server/db.ts com helpers para repertórios, músicas e artigos
- [x] Criar server/routers.ts com endpoints públicos e admin
- [x] Criar design system (index.css) com tokens de cor, gradientes litúrgicos e animações
- [x] Criar ModernHeader com navegação responsiva
- [x] Criar Footer e WhatsAppButton flutuante
- [x] Criar SEO component para meta tags e Open Graph
- [x] Criar página Home com hero e cards de tempos litúrgicos
- [x] Criar página Repertórios (lista com filtros por tempo litúrgico)
- [x] Criar página Repertório Individual (músicas agrupadas por momento)
- [x] Criar página Blog (lista de artigos com busca)
- [x] Criar página Artigo Individual (conteúdo markdown + SEO)
- [x] Criar página Admin (CRUD de repertórios e artigos)
- [x] Criar App.tsx com todas as rotas
- [x] 30/30 testes passando

## Melhorias Futuras

- [x] Painel admin: upload de imagem de capa para artigos — concluído
- [ ] Painel admin: adicionar/remover músicas individualmente por momento
- [ ] Página de repertório: links para YouTube e cifra por música
- [ ] SEO: sitemap.xml automático
- [ ] SEO: structured data JSON-LD para artigos e repertórios
- [ ] Blog: paginação quando houver muitos artigos
- [ ] Importar os 7 repertórios gerados na extração anterior

## Admin — Promoção de Usuário e Painel

- [x] Promover fortuna590@gmail.com a admin — já estava como admin (role: admin)
- [x] Verificar CRUD completo de artigos de blog no painel admin — funcionando
- [x] Verificar CRUD completo de músicas nos repertórios no painel admin — funcionando
- [x] Testar acesso ao painel admin com o usuário promovido — OK

## Bug Fixes

- [x] Corrigir bug de tela preta na edição de artigos no mobile (Android Chrome) — parsing de tags normalizado + card-glass substituído por bg-slate-900 nos modais

## Sistema de Recomendação Inteligente

- [x] Adicionar campo `tags` à tabela lm_repertorios e migrar banco
- [x] Criar endpoint `recomendacoes.paraRepertorio` — retorna 3 repertórios + 3 artigos por tempo litúrgico e categoria
- [x] Criar endpoint `recomendacoes.paraArtigo` — retorna 3 repertórios + 3 artigos por categoria e tags
- [x] Criar endpoint `recomendacoes.destaques` — retorna sugestões contextuais baseadas na data atual (Advento→Natal, Quaresma→Páscoa)
- [x] Criar componente `RecomendacoesSection` reutilizável com design system (cards, hover effects, responsivo)
- [x] Integrar recomendações na página Repertório Individual
- [x] Integrar recomendações na página Artigo Individual
- [x] Integrar destaques contextuais na Home ("Sugerido para você agora")

## Onboarding e UX

- [x] Criar componente OnboardingModal (3 passos, localStorage, fechável com animação)
- [x] Integrar OnboardingModal no App.tsx — aparece apenas na primeira visita
- [x] Adicionar dica contextual na página de Repertório Individual ("Você pode copiar ou exportar")
- [x] Criar página /como-funciona com SEO, passo a passo, benefícios e FAQ
- [x] Adicionar link "Como Funciona" no menu de navegação (desktop e mobile)
