#!/bin/bash

# =============================================================================
# Script Automatizado de Deploy no GitHub
# =============================================================================
# Este script vai enviar todo o código do LouvaMais para o seu GitHub
# =============================================================================

echo "🚀 Deploy Automatizado - LouvaMais"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não está instalado!${NC}"
    echo "Instale o Git em: https://git-scm.com/downloads"
    exit 1
fi

echo -e "${BLUE}📝 Configuração do GitHub${NC}"
echo ""

# Pedir informações do usuário
read -p "Digite seu nome de usuário do GitHub: " GITHUB_USER
read -p "Digite o nome do repositório (ex: louvamais): " REPO_NAME

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "Você precisará fazer login no GitHub quando solicitado."
echo "Use seu Personal Access Token como senha."
echo ""
echo "Para criar um token:"
echo "1. Acesse: https://github.com/settings/tokens"
echo "2. Clique em 'Generate new token (classic)'"
echo "3. Marque: repo, workflow, write:packages"
echo "4. Copie o token gerado"
echo ""
read -p "Pressione ENTER para continuar..."

echo ""
echo -e "${BLUE}🔧 Inicializando repositório Git...${NC}"

# Remover .git existente se houver
if [ -d ".git" ]; then
    rm -rf .git
fi

# Inicializar Git
git init
git branch -M main

echo -e "${GREEN}✅ Repositório inicializado${NC}"

# Configurar Git (se necessário)
echo ""
echo -e "${BLUE}👤 Configurando Git...${NC}"
read -p "Digite seu nome completo: " GIT_NAME
read -p "Digite seu email do GitHub: " GIT_EMAIL

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

echo -e "${GREEN}✅ Git configurado${NC}"

# Adicionar todos os arquivos
echo ""
echo -e "${BLUE}📦 Adicionando arquivos...${NC}"
git add .

# Fazer commit
echo -e "${BLUE}💾 Criando commit...${NC}"
git commit -m "Initial commit - LouvaMais

- Plataforma completa de repertórios litúrgicos
- Frontend: React 19 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + tRPC
- Database: PostgreSQL (Drizzle ORM)
- Pronto para deploy na Vercel + Supabase"

echo -e "${GREEN}✅ Commit criado${NC}"

# Adicionar remote
echo ""
echo -e "${BLUE}🔗 Conectando ao GitHub...${NC}"
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo -e "${GREEN}✅ Conectado ao repositório${NC}"

# Push para o GitHub
echo ""
echo -e "${BLUE}📤 Enviando código para o GitHub...${NC}"
echo -e "${YELLOW}⚠️  Faça login quando solicitado!${NC}"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 SUCESSO!${NC}"
    echo ""
    echo "✅ Código enviado para o GitHub com sucesso!"
    echo ""
    echo "📍 Seu repositório:"
    echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo -e "${BLUE}➡️  PRÓXIMO PASSO:${NC}"
    echo "   Siga as instruções do arquivo DEPLOY-RAPIDO.md"
    echo "   para configurar Supabase e Vercel"
else
    echo ""
    echo -e "${RED}❌ Erro ao enviar código${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "1. Repositório não existe no GitHub"
    echo "2. Token de acesso inválido"
    echo "3. Sem permissão de escrita"
    echo ""
    echo "Solução:"
    echo "1. Crie o repositório em: https://github.com/new"
    echo "2. Nome do repositório: $REPO_NAME"
    echo "3. Deixe VAZIO (não adicione README, .gitignore, etc)"
    echo "4. Execute este script novamente"
fi
