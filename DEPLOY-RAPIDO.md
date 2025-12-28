# ⚡ Deploy Rápido - LouvaMais em 3 Passos

> **Tempo estimado:** 10-15 minutos

---

## 📋 Antes de Começar

Certifique-se de ter:

- ✅ Conta no GitHub criada
- ✅ Conta no Vercel criada e conectada ao GitHub
- ✅ Conta no Supabase criada
- ✅ Git instalado no computador

---

## 🚀 PASSO 1: Enviar Código para o GitHub

### 1.1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Repository name:** `louvamais`
3. **Visibility:** Private (recomendado)
4. **NÃO marque nenhuma opção** (deixe vazio)
5. Clique em **"Create repository"**

### 1.2. Executar Script Automatizado

**No Windows:**
```bash
# Abra o PowerShell na pasta do projeto
cd caminho\para\repertorio-advento
bash deploy-github.sh
```

**No Mac/Linux:**
```bash
# Abra o Terminal na pasta do projeto
cd /caminho/para/repertorio-advento
./deploy-github.sh
```

### 1.3. Fazer Login no GitHub

Quando solicitado:
1. **Username:** Seu usuário do GitHub
2. **Password:** Use um **Personal Access Token** (não sua senha)

**Como criar o token:**
1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Marque: `repo`, `workflow`, `write:packages`
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você não verá novamente!)
6. Cole como senha quando o script pedir

✅ **Pronto!** Código enviado para o GitHub.

---

## 🗄️ PASSO 2: Configurar Banco de Dados no Supabase

### 2.1. Criar Projeto

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `louvamais-db`
   - **Database Password:** Crie uma senha forte e **ANOTE**
   - **Region:** `South America (São Paulo)`
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos

### 2.2. Executar Migrações

1. No painel do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Abra o arquivo `supabase-migration.sql` do projeto
4. Copie **TODO** o conteúdo
5. Cole no editor SQL
6. Clique em **"Run"** (botão verde)

✅ **Pronto!** Banco de dados criado.

### 2.3. Copiar String de Conexão

1. Clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"Database"**
3. Role até **"Connection string"**
4. Selecione aba **"URI"**
5. Copie a string completa
6. **Substitua `[YOUR-PASSWORD]` pela senha que você criou**
7. **ANOTE ESSA STRING** - você vai usar no próximo passo

Exemplo:
```
postgresql://postgres:SUA_SENHA@db.abcdefgh.supabase.co:5432/postgres
```

---

## 🌐 PASSO 3: Deploy na Vercel

### 3.1. Importar do GitHub

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Encontre `louvamais` e clique em **"Import"**

### 3.2. Configurar Build

Na tela de configuração:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Other` |
| **Build Command** | `pnpm build` |
| **Output Directory** | `client/dist` |
| **Install Command** | `pnpm install` |

### 3.3. Adicionar Variáveis de Ambiente

Role até **"Environment Variables"** e adicione:

#### Variáveis Obrigatórias:

| Nome | Valor | Como Obter |
|------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:...` | String do Supabase (Passo 2.3) |
| `JWT_SECRET` | Gere um valor aleatório | Execute: `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Digite manualmente |

**Para gerar JWT_SECRET:**

**Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

### 3.4. Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 3-5 minutos
3. Quando aparecer "🎉 Congratulations!", clique em **"Visit"**

✅ **PRONTO! SEU SITE ESTÁ NO AR!** 🎉

---

## 🌍 BÔNUS: Adicionar Domínio Personalizado

### Adicionar Domínio na Vercel

1. No dashboard da Vercel, clique no projeto
2. Vá em **"Settings"** → **"Domains"**
3. Digite seu domínio e clique em **"Add"**

### Configurar DNS na Hostinger

1. Acesse o painel da Hostinger
2. Vá em **"Domínios"** → Seu domínio → **"DNS"**
3. Adicione:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

4. Aguarde 10-30 minutos para propagação

✅ **Domínio configurado!**

---

## 🎯 Resumo dos 3 Passos

1. ✅ **GitHub:** Execute `deploy-github.sh`
2. ✅ **Supabase:** Crie projeto + Execute SQL
3. ✅ **Vercel:** Import + 3 variáveis + Deploy

**Tempo total:** 10-15 minutos

---

## 🆘 Problemas?

### "Git not found"
- Instale o Git: https://git-scm.com/downloads

### "Authentication failed" no GitHub
- Use Personal Access Token, não sua senha
- Crie em: https://github.com/settings/tokens

### "Build failed" na Vercel
- Verifique se as 3 variáveis obrigatórias foram adicionadas
- Confirme que `DATABASE_URL` tem a senha correta

### "Database connection failed"
- Verifique se executou o SQL no Supabase
- Confirme que a senha no `DATABASE_URL` está correta

---

## 📞 Suporte

- **Email:** fortuna590@gmail.com
- **Documentação Completa:** Veja `GUIA-DEPLOY-VERCEL-SUPABASE.md`

---

**Desenvolvido com ❤️ por Manus AI**
