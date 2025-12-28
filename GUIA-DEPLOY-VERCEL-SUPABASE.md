# 🚀 Guia Completo de Deploy - LouvaMais na Vercel + Supabase

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Parte 1: Configurar GitHub](#parte-1-configurar-github)
4. [Parte 2: Configurar Supabase (Banco de Dados)](#parte-2-configurar-supabase-banco-de-dados)
5. [Parte 3: Configurar Vercel (Hospedagem)](#parte-3-configurar-vercel-hospedagem)
6. [Parte 4: Configurar Variáveis de Ambiente](#parte-4-configurar-variáveis-de-ambiente)
7. [Parte 5: Apontar Domínio da Hostinger](#parte-5-apontar-domínio-da-hostinger)
8. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Visão Geral

Este guia vai te ajudar a fazer o deploy completo do LouvaMais usando as seguintes tecnologias:

| Serviço | Função | Custo |
|---------|--------|-------|
| **GitHub** | Armazenar código-fonte | Gratuito |
| **Vercel** | Hospedagem do site | Gratuito (até 100GB bandwidth/mês) |
| **Supabase** | Banco de dados PostgreSQL | Gratuito (até 500MB) |
| **Hostinger** | Domínio personalizado | Você já possui |

**Tempo estimado:** 45-60 minutos

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter:

- [ ] Conta no GitHub (criar em [github.com](https://github.com))
- [ ] Conta no Vercel (criar em [vercel.com](https://vercel.com))
- [ ] Conta no Supabase (criar em [supabase.com](https://supabase.com))
- [ ] Acesso ao painel da Hostinger
- [ ] Git instalado no seu computador
- [ ] Código do projeto LouvaMais baixado

---

## 📦 Parte 1: Configurar GitHub

### 1.1. Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"New"** (verde) no canto superior direito
3. Preencha os dados:
   - **Repository name:** `louvamais`
   - **Description:** `Plataforma de repertórios litúrgicos católicos`
   - **Visibility:** Private (recomendado) ou Public
   - **NÃO** marque "Initialize this repository with a README"
4. Clique em **"Create repository"**

### 1.2. Enviar Código para o GitHub

Abra o terminal/prompt de comando na pasta do projeto e execute:

```bash
cd /caminho/para/repertorio-advento

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit - LouvaMais"

# Conectar com o repositório remoto (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/louvamais.git

# Enviar código para o GitHub
git branch -M main
git push -u origin main
```

**✅ Checkpoint:** Acesse seu repositório no GitHub e confirme que todos os arquivos foram enviados.

---

## 🗄️ Parte 2: Configurar Supabase (Banco de Dados)

### 2.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name:** `louvamais-db`
   - **Database Password:** Crie uma senha forte e **ANOTE EM LOCAL SEGURO**
   - **Region:** `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan:** Free
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o banco é criado

### 2.2. Executar Migrações do Banco

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo `supabase-migration.sql` do projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **"Run"** (botão verde no canto inferior direito)
7. Aguarde a execução (pode levar 10-20 segundos)

**✅ Checkpoint:** Clique em "Table Editor" no menu lateral. Você deve ver as tabelas: `users`, `clicks`, `notifications`, `repertorios`, `artigos`, `products`, `depoimentos`, `liturgias`.

### 2.3. Obter String de Conexão

1. No painel do Supabase, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"Database"**
3. Role até a seção **"Connection string"**
4. Selecione a aba **"URI"**
5. Copie a string que começa com `postgresql://postgres:...`
6. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 2.1
7. **ANOTE ESSA STRING** - você vai precisar dela na Vercel

Exemplo:
```
postgresql://postgres:SUA_SENHA_AQUI@db.abcdefgh.supabase.co:5432/postgres
```

---

## 🌐 Parte 3: Configurar Vercel (Hospedagem)

### 3.1. Importar Projeto do GitHub

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Se for a primeira vez, clique em **"Connect GitHub Account"** e autorize
5. Encontre o repositório `louvamais` e clique em **"Import"**

### 3.2. Configurar Build Settings

Na tela de configuração do projeto:

1. **Framework Preset:** Selecione `Other`
2. **Root Directory:** Deixe em branco (`.`)
3. **Build Command:** `pnpm build`
4. **Output Directory:** `client/dist`
5. **Install Command:** `pnpm install`

**NÃO clique em "Deploy" ainda!** Primeiro precisamos configurar as variáveis de ambiente.

---

## 🔐 Parte 4: Configurar Variáveis de Ambiente

Ainda na página de configuração da Vercel, role até a seção **"Environment Variables"**.

### 4.1. Variáveis Obrigatórias

Adicione as seguintes variáveis **UMA POR UMA**:

| Nome da Variável | Valor | Onde Obter |
|------------------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:...` | String de conexão do Supabase (Parte 2.3) |
| `JWT_SECRET` | Gere um valor aleatório | Execute: `openssl rand -base64 32` no terminal |
| `NODE_ENV` | `production` | Digite manualmente |
| `PRODUCTION_URL` | `https://seu-dominio.com` | Seu domínio da Hostinger (ou deixe vazio por enquanto) |

### 4.2. Variáveis Opcionais (Configure depois)

Essas variáveis são para funcionalidades avançadas. Você pode adicionar depois:

**AWS S3 (Upload de arquivos):**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

**Stripe (Pagamentos):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`

**Resend (Envio de emails):**
- `RESEND_API_KEY`

### 4.3. Fazer Deploy

1. Após adicionar as variáveis obrigatórias, clique em **"Deploy"**
2. Aguarde 3-5 minutos enquanto a Vercel faz o build e deploy
3. Quando aparecer "🎉 Congratulations!", clique em **"Continue to Dashboard"**
4. Clique em **"Visit"** para ver seu site no ar!

**✅ Checkpoint:** Seu site deve estar acessível em um endereço como `louvamais.vercel.app`

---

## 🌍 Parte 5: Apontar Domínio da Hostinger

### 5.1. Adicionar Domínio na Vercel

1. No dashboard da Vercel, clique no seu projeto `louvamais`
2. Clique na aba **"Settings"**
3. Clique em **"Domains"** no menu lateral
4. Digite seu domínio (ex: `louvamais.com.br`) e clique em **"Add"**
5. A Vercel vai mostrar as configurações de DNS necessárias

### 5.2. Configurar DNS na Hostinger

1. Acesse o painel da Hostinger ([hostinger.com.br](https://hostinger.com.br))
2. Vá em **"Domínios"** → Selecione seu domínio
3. Clique em **"DNS / Nameservers"**
4. Clique em **"Gerenciar"**

### 5.3. Adicionar Registros DNS

**Opção A: Domínio Principal (louvamais.com.br)**

Adicione os seguintes registros:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 3600 |
| CNAME | www | `cname.vercel-dns.com` | 3600 |

**Opção B: Subdomínio (app.louvamais.com.br)**

Adicione apenas:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| CNAME | app | `cname.vercel-dns.com` | 3600 |

### 5.4. Aguardar Propagação

1. Clique em **"Salvar"** na Hostinger
2. Volte para a Vercel
3. Aguarde 10-30 minutos para a propagação do DNS
4. A Vercel vai verificar automaticamente e emitir certificado SSL

**✅ Checkpoint:** Quando o domínio estiver configurado, você verá um ✅ verde na Vercel e poderá acessar seu site pelo domínio personalizado com HTTPS.

---

## 🔧 Solução de Problemas

### Problema: "Build failed" na Vercel

**Solução:**
1. Verifique se todas as variáveis de ambiente obrigatórias foram adicionadas
2. Confirme que o `DATABASE_URL` está correto e com a senha substituída
3. Veja os logs de build na Vercel para identificar o erro específico

### Problema: "Database connection failed"

**Solução:**
1. Volte no Supabase e confirme que as migrações foram executadas
2. Verifique se a senha no `DATABASE_URL` está correta
3. Teste a conexão executando: `psql "sua-connection-string-aqui"`

### Problema: Domínio não funciona após 30 minutos

**Solução:**
1. Use [whatsmydns.net](https://whatsmydns.net) para verificar a propagação
2. Confirme que os registros DNS na Hostinger estão exatamente como especificado
3. Tente acessar em modo anônimo/privado do navegador
4. Limpe o cache do DNS: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

### Problema: Site carrega mas funcionalidades não funcionam

**Solução:**
1. Abra o Console do navegador (F12) e veja se há erros
2. Verifique se as variáveis de ambiente estão corretas na Vercel
3. Confirme que o banco de dados tem dados (vá no Supabase → Table Editor)

---

## 📞 Suporte

Se encontrar problemas que não consegue resolver:

1. **Documentação Oficial:**
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [GitHub Docs](https://docs.github.com)

2. **Comunidades:**
   - [Vercel Discord](https://vercel.com/discord)
   - [Supabase Discord](https://discord.supabase.com)

3. **Contato:**
   - Email: fortuna590@gmail.com

---

## 🎉 Parabéns!

Seu site LouvaMais está no ar! 🚀

**Próximos passos sugeridos:**

1. Configure as variáveis opcionais (AWS S3, Stripe, Resend)
2. Adicione conteúdo inicial (artigos, depoimentos)
3. Teste todas as funcionalidades
4. Configure backups automáticos no Supabase
5. Monitore o uso e performance na Vercel

---

**Desenvolvido com ❤️ por Manus AI**
