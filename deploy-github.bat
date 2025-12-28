@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM =============================================================================
REM Script Automatizado de Deploy no GitHub (Windows)
REM =============================================================================

echo.
echo 🚀 Deploy Automatizado - LouvaMais
echo ==================================
echo.

REM Verificar se Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git não está instalado!
    echo.
    echo Instale o Git em: https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

echo 📝 Configuração do GitHub
echo.

REM Pedir informações do usuário
set /p GITHUB_USER="Digite seu nome de usuário do GitHub: "
set /p REPO_NAME="Digite o nome do repositório (ex: louvamais): "

echo.
echo ⚠️  IMPORTANTE:
echo Você precisará fazer login no GitHub quando solicitado.
echo Use seu Personal Access Token como senha.
echo.
echo Para criar um token:
echo 1. Acesse: https://github.com/settings/tokens
echo 2. Clique em 'Generate new token (classic)'
echo 3. Marque: repo, workflow, write:packages
echo 4. Copie o token gerado
echo.
pause

echo.
echo 🔧 Inicializando repositório Git...

REM Remover .git existente se houver
if exist ".git" (
    rmdir /s /q ".git"
)

REM Inicializar Git
git init
git branch -M main

echo ✅ Repositório inicializado

REM Configurar Git
echo.
echo 👤 Configurando Git...
set /p GIT_NAME="Digite seu nome completo: "
set /p GIT_EMAIL="Digite seu email do GitHub: "

git config user.name "%GIT_NAME%"
git config user.email "%GIT_EMAIL%"

echo ✅ Git configurado

REM Adicionar todos os arquivos
echo.
echo 📦 Adicionando arquivos...
git add .

REM Fazer commit
echo 💾 Criando commit...
git commit -m "Initial commit - LouvaMais" -m "- Plataforma completa de repertórios litúrgicos" -m "- Frontend: React 19 + TypeScript + Tailwind CSS" -m "- Backend: Node.js + Express + tRPC" -m "- Database: PostgreSQL (Drizzle ORM)" -m "- Pronto para deploy na Vercel + Supabase"

echo ✅ Commit criado

REM Adicionar remote
echo.
echo 🔗 Conectando ao GitHub...
git remote add origin "https://github.com/%GITHUB_USER%/%REPO_NAME%.git"

echo ✅ Conectado ao repositório

REM Push para o GitHub
echo.
echo 📤 Enviando código para o GitHub...
echo ⚠️  Faça login quando solicitado!
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCESSO!
    echo.
    echo ✅ Código enviado para o GitHub com sucesso!
    echo.
    echo 📍 Seu repositório:
    echo    https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo.
    echo ➡️  PRÓXIMO PASSO:
    echo    Siga as instruções do arquivo DEPLOY-RAPIDO.md
    echo    para configurar Supabase e Vercel
) else (
    echo.
    echo ❌ Erro ao enviar código
    echo.
    echo Possíveis causas:
    echo 1. Repositório não existe no GitHub
    echo 2. Token de acesso inválido
    echo 3. Sem permissão de escrita
    echo.
    echo Solução:
    echo 1. Crie o repositório em: https://github.com/new
    echo 2. Nome do repositório: %REPO_NAME%
    echo 3. Deixe VAZIO (não adicione README, .gitignore, etc)
    echo 4. Execute este script novamente
)

echo.
pause
