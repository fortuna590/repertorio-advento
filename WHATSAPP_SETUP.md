# Configuração do WhatsApp - Evolution API

Este sistema utiliza a **Evolution API** para envio de mensagens WhatsApp. A Evolution API é uma solução open-source, gratuita e muito popular no Brasil.

## 🚀 Opções de Uso

### Opção 1: Serviço em Nuvem (Recomendado)

Existem diversos provedores que oferecem Evolution API hospedada:

- **Evo Cloud** (https://evo.cloud) - Plano gratuito disponível
- **Z-API** (https://z-api.io) - Compatível com Evolution API
- Outros provedores brasileiros

### Opção 2: Self-Hosted (Gratuito)

Hospede sua própria instância Evolution API:

1. **Requisitos:**
   - Servidor VPS (pode usar Oracle Cloud Free Tier)
   - Docker instalado

2. **Instalação:**
   ```bash
   git clone https://github.com/EvolutionAPI/evolution-api.git
   cd evolution-api
   docker-compose up -d
   ```

3. **Documentação completa:**
   https://doc.evolution-api.com/

## ⚙️ Configuração no Sistema

Após ter sua instância Evolution API funcionando, configure as variáveis de ambiente:

### Variáveis Necessárias

Adicione no painel de **Settings → Secrets** do Manus:

```
WHATSAPP_API_URL=https://sua-api.evolution.com.br
WHATSAPP_API_KEY=sua-chave-api
WHATSAPP_INSTANCE=nome-da-sua-instancia
```

### Exemplo de Valores

```
WHATSAPP_API_URL=https://api.evolution.com.br
WHATSAPP_API_KEY=B6D9C8F7E5A4D3C2B1A0
WHATSAPP_INSTANCE=escalas_louvamais
```

## 📱 Como Funciona

### 1. Conectar WhatsApp

Após configurar a Evolution API, você precisa conectar seu número WhatsApp:

1. Acesse o painel da Evolution API
2. Crie uma nova instância
3. Escaneie o QR Code com seu WhatsApp
4. Pronto! Seu número está conectado

### 2. Envio Automático

O sistema enviará mensagens WhatsApp automaticamente em dois momentos:

- **Ao adicionar participante**: Convite com link de confirmação
- **24h antes da escala**: Lembrete para participantes pendentes

### 3. Formato das Mensagens

**Convite:**
```
🎵 *Olá, João!*

Você foi convidado(a) para participar da escala:

📋 *Missa 25/01 - 9h*
🎤 Função: *Violão*
📅 Data: 25/01/2026
🕐 Horário: 09:00
📍 Local: Igreja Matriz

✅ *Confirme sua presença clicando no link:*
https://louvamais.com/confirmar/abc123

_Enviado pelo Sistema de Escalas LouvaMais_
```

**Lembrete:**
```
⏰ *Lembrete de Escala*

Olá, João!

Lembrando que amanhã você tem escala:

📋 *Missa 25/01 - 9h*
🎤 Função: *Violão*
📅 Data: 25/01/2026
🕐 Horário: 09:00

⚠️ *Você ainda não confirmou sua presença!*
Confirme agora: https://louvamais.com/confirmar/abc123

_Enviado pelo Sistema de Escalas LouvaMais_
```

## 🔧 Modo Desenvolvimento

Se as variáveis de ambiente não estiverem configuradas, o sistema funcionará em **modo desenvolvimento**:

- Mensagens não serão enviadas
- Logs aparecerão no console do servidor
- Você pode ver o conteúdo das mensagens que seriam enviadas

Isso permite testar o sistema sem precisar configurar o WhatsApp imediatamente.

## 💡 Dicas

1. **Número Comercial**: Use um número WhatsApp Business para melhor organização
2. **Backup**: Mantenha backup das configurações da Evolution API
3. **Monitoramento**: Verifique os logs do servidor para acompanhar envios
4. **Testes**: Teste primeiro com seu próprio número antes de usar em produção

## 📚 Recursos Adicionais

- **Documentação Evolution API**: https://doc.evolution-api.com/
- **Comunidade**: https://github.com/EvolutionAPI/evolution-api/discussions
- **Vídeos tutoriais**: Busque "Evolution API tutorial" no YouTube

## ⚠️ Observações Importantes

1. **Política do WhatsApp**: Respeite as políticas de uso do WhatsApp Business
2. **Limite de mensagens**: Evite spam, envie apenas mensagens relevantes
3. **LGPD**: Garanta consentimento dos participantes para receber mensagens
4. **Custo**: Evolution API é gratuita, mas você pode ter custos de hospedagem

## 🆘 Suporte

Se tiver dúvidas sobre a configuração:

1. Consulte a documentação oficial da Evolution API
2. Entre em contato com o suporte do seu provedor
3. Busque ajuda na comunidade Evolution API no GitHub
