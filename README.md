# 🎵 LouvaMais - Plataforma de Repertórios Litúrgicos Católicos

> Sua plataforma completa para ministérios de música. Repertórios prontos, cifras organizadas e ferramentas para elevar o louvor da sua comunidade.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU-USUARIO/louvamais)

---

## 📖 Sobre o Projeto

O **LouvaMais** é uma plataforma web desenvolvida para facilitar a vida de ministérios de música católicos. Com ela, você pode:

- 🎼 **Explorar repertórios** prontos para Advento, Natal, Quaresma e outros tempos litúrgicos
- 📝 **Montar repertórios personalizados** selecionando músicas por momento da missa
- 📄 **Exportar em PDF** com QR codes para YouTube e cifras
- ⭐ **Favoritar músicas** para acesso rápido
- 📊 **Acompanhar estatísticas** de uso e músicas mais populares
- 📱 **Compartilhar repertórios** com outros ministérios

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca JavaScript para UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna
- **Tailwind CSS 4** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI modernos
- **Wouter** - Roteamento client-side
- **tRPC** - API type-safe

### Backend
- **Node.js 22** - Runtime JavaScript
- **Express** - Framework web
- **Drizzle ORM** - ORM TypeScript-first
- **PostgreSQL** - Banco de dados relacional
- **PDFKit** - Geração de PDFs

### Infraestrutura
- **Vercel** - Hospedagem e deploy
- **Supabase** - Banco de dados PostgreSQL
- **AWS S3** - Armazenamento de arquivos
- **Stripe** - Processamento de pagamentos
- **Resend** - Envio de emails

---

## 🚀 Deploy Rápido

### Pré-requisitos

- Node.js 22+
- pnpm 10+
- Conta no Supabase (banco de dados)
- Conta na Vercel (hospedagem)

### Opção 1: Deploy Automático na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU-USUARIO/louvamais)

### Opção 2: Deploy Manual

Siga o **[Guia Completo de Deploy](./GUIA-DEPLOY-VERCEL-SUPABASE.md)** para instruções detalhadas passo a passo.

---

## 💻 Desenvolvimento Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU-USUARIO/louvamais.git
cd louvamais
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis necessárias (veja `.env.example` para detalhes).

### 4. Configurar Banco de Dados

```bash
# Executar migrações
pnpm db:push
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

O site estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
louvamais/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── data/          # Dados estáticos (repertório)
│   │   ├── lib/           # Utilitários
│   │   └── hooks/         # Custom React hooks
│   └── public/            # Arquivos estáticos
│
├── server/                # Backend (Node.js + Express)
│   ├── routers/           # Rotas da API (tRPC)
│   ├── _core/             # Funções core
│   └── db.ts              # Configuração do banco
│
├── drizzle/               # Migrações do banco
├── shared/                # Código compartilhado
├── vercel.json            # Configuração Vercel
└── package.json           # Dependências
```

---

## 🎯 Funcionalidades

### ✅ Implementadas

- [x] Repertório completo de músicas para Advento, Natal e Tempo do Natal
- [x] Sistema de montagem de repertórios personalizados
- [x] Exportação de repertórios em PDF com QR codes
- [x] Sistema de favoritos de músicas
- [x] Autenticação de usuários (JWT + OAuth)
- [x] Painel administrativo
- [x] Sistema de notificações
- [x] Estatísticas de uso
- [x] Blog de artigos
- [x] Sistema de depoimentos
- [x] Calendário litúrgico

### 🚧 Em Desenvolvimento

- [ ] Integração com Stripe para doações
- [ ] Upload de cifras personalizadas
- [ ] Sistema de comentários em músicas
- [ ] App mobile (React Native)
- [ ] Integração com Spotify/YouTube Music

---

## 📚 Documentação

- **[Guia de Deploy](./GUIA-DEPLOY-VERCEL-SUPABASE.md)** - Como fazer deploy na Vercel + Supabase
- **[Variáveis de Ambiente](./.env.example)** - Lista completa de variáveis necessárias
- **[Migrações do Banco](./supabase-migration.sql)** - Schema completo do banco de dados

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 📞 Contato

**Tiago Fortuna Santos**
- Email: fortuna590@gmail.com
- Website: [louvamais.com.br](https://louvamais.com.br)

---

## 🙏 Agradecimentos

- Comunidade católica brasileira
- Ministérios de música que inspiraram este projeto
- Todos os contribuidores e usuários

---

**Desenvolvido com ❤️ e ☕ por Tiago Fortuna Santos**

*"Louvai ao Senhor com harpas, com harpas e ao som de cânticos!" - Salmo 98:5*
