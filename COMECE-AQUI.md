# 🎯 COMECE AQUI - Deploy em 3 Passos

> **Você está a 10 minutos de colocar o LouvaMais no ar!** 🚀

---

## 📥 PASSO 0: Baixar o Projeto

### Opção A: Via Management UI do Manus (Recomendado)

1. Clique no ícone **⚙️** no canto superior direito
2. Clique em **"Code"** no painel lateral
3. Clique em **"Download All Files"**
4. Extraia o ZIP baixado

### Opção B: Via Git Clone

```bash
# Se você já enviou para o GitHub
git clone https://github.com/SEU-USUARIO/louvamais.git
cd louvamais
```

---

## ⚡ 3 PASSOS PARA O DEPLOY

### 📝 Pré-requisitos (5 minutos)

Crie suas contas (se ainda não tem):

1. **GitHub:** https://github.com/signup
2. **Vercel:** https://vercel.com/signup (use "Continue with GitHub")
3. **Supabase:** https://supabase.com/dashboard (use "Continue with GitHub")

---

### 🚀 PASSO 1: GitHub (2 minutos)

1. Crie repositório: https://github.com/new
   - Nome: `louvamais`
   - Deixe **VAZIO** (não marque nada)
   
2. Execute o script:

**Windows:** Clique duas vezes em `deploy-github.bat`

**Mac/Linux:** 
```bash
./deploy-github.sh
```

3. Quando pedir senha, use um **Personal Access Token**:
   - Crie em: https://github.com/settings/tokens
   - Marque: `repo`, `workflow`, `write:packages`

✅ **Pronto!** Código no GitHub.

---

### 🗄️ PASSO 2: Supabase (3 minutos)

1. Crie projeto: https://supabase.com/dashboard
   - Nome: `louvamais-db`
   - Senha: Crie uma forte e **ANOTE**
   - Região: `South America (São Paulo)`

2. Execute SQL:
   - Clique em **"SQL Editor"** → **"New query"**
   - Abra o arquivo `supabase-migration.sql`
   - Copie TODO o conteúdo e cole
   - Clique em **"Run"**

3. Copie a connection string:
   - **Settings** → **Database** → **Connection string** → **URI**
   - Substitua `[YOUR-PASSWORD]` pela senha
   - **ANOTE ESSA STRING**

✅ **Pronto!** Banco criado.

---

### 🌐 PASSO 3: Vercel (5 minutos)

1. Importe: https://vercel.com/new
   - Selecione `louvamais` do GitHub
   
2. Configure:
   - **Framework:** `Other`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `client/dist`
   - **Install Command:** `pnpm install`

3. Adicione variáveis de ambiente:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | String do Supabase |
| `JWT_SECRET` | Gere: `openssl rand -base64 32` |
| `NODE_ENV` | `production` |

4. Clique em **"Deploy"**

✅ **PRONTO! SITE NO AR!** 🎉

---

## 📚 Documentação Completa

- **Deploy Rápido:** `DEPLOY-RAPIDO.md` (10-15 min)
- **Guia Detalhado:** `GUIA-DEPLOY-VERCEL-SUPABASE.md` (45-60 min)
- **Informações Técnicas:** `README.md`

---

## 🆘 Problemas?

### Git não encontrado
```bash
# Instale: https://git-scm.com/downloads
```

### Erro de autenticação no GitHub
- Use **Personal Access Token**, não sua senha
- Crie em: https://github.com/settings/tokens

### Build failed na Vercel
- Verifique as 3 variáveis de ambiente
- Confirme que `DATABASE_URL` tem a senha correta

### Erro de conexão com banco
- Confirme que executou o SQL no Supabase
- Verifique se a senha no `DATABASE_URL` está correta

---

## 📞 Suporte

**Email:** fortuna590@gmail.com

---

## 🎯 Checklist Rápido

- [ ] Baixei o projeto
- [ ] Criei conta no GitHub
- [ ] Criei conta no Vercel
- [ ] Criei conta no Supabase
- [ ] Executei `deploy-github.bat` ou `deploy-github.sh`
- [ ] Criei projeto no Supabase
- [ ] Executei `supabase-migration.sql`
- [ ] Copiei connection string do Supabase
- [ ] Importei projeto na Vercel
- [ ] Adicionei 3 variáveis de ambiente
- [ ] Fiz deploy na Vercel
- [ ] ✅ **SITE NO AR!**

---

**Boa sorte! Você consegue! 💪**

*Desenvolvido com ❤️ por Manus AI*
