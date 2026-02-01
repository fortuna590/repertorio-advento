# Guia de Verificação de Domínio no Resend

Este guia explica como configurar o domínio `louvamais.com` no Resend para enviar emails com `noreply@louvamais.com`.

---

## Passo 1: Acessar o Resend Dashboard

1. Acesse https://resend.com/login
2. Faça login com sua conta Resend
3. No menu lateral, clique em **"Domains"**

---

## Passo 2: Adicionar o Domínio

1. Clique no botão **"Add Domain"**
2. Digite: `louvamais.com`
3. Clique em **"Add"**

---

## Passo 3: Obter Registros DNS

Após adicionar o domínio, o Resend fornecerá 3 registros DNS que você precisa adicionar:

### 1. **Registro SPF (TXT)**
```
Tipo: TXT
Nome: @ (ou deixe em branco)
Valor: v=spf1 include:resend.com ~all
```

### 2. **Registro DKIM (TXT)**
```
Tipo: TXT
Nome: resend._domainkey
Valor: [valor fornecido pelo Resend - copie exatamente como mostrado]
```

### 3. **Registro DMARC (TXT)** *(Opcional mas recomendado)*
```
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:louvamais590@gmail.com
```

---

## Passo 4: Adicionar Registros no Provedor de Domínio

### Se seu domínio está no **GoDaddy:**
1. Acesse https://dcc.godaddy.com/manage/louvamais.com/dns
2. Clique em **"Add"** para cada registro
3. Selecione tipo **"TXT"**
4. Cole os valores fornecidos pelo Resend
5. Clique em **"Save"**

### Se seu domínio está no **Registro.br:**
1. Acesse https://registro.br/
2. Faça login e vá em **"Meus Domínios"**
3. Clique em **"louvamais.com"**
4. Vá em **"DNS"** → **"Adicionar Registro"**
5. Adicione os 3 registros TXT
6. Clique em **"Salvar"**

### Se seu domínio está em outro provedor:
1. Acesse o painel de controle do seu provedor
2. Procure por **"DNS Management"** ou **"Gerenciar DNS"**
3. Adicione os 3 registros TXT fornecidos pelo Resend

---

## Passo 5: Aguardar Verificação

1. Após adicionar os registros DNS, volte ao Resend Dashboard
2. Clique em **"Verify"** ao lado do domínio
3. A verificação pode levar de alguns minutos até 48 horas
4. Você receberá um email quando o domínio for verificado

---

## Passo 6: Testar o Envio

Após a verificação ser concluída:

1. Acesse o site LouvaMais
2. Crie uma escala de teste
3. Clique em **"Enviar Lembretes"**
4. Verifique se o email foi recebido com remetente `noreply@louvamais.com`

---

## Solução de Problemas

### ❌ Domínio não verifica após 48h
- Verifique se os registros DNS foram adicionados corretamente
- Certifique-se de que não há espaços extras nos valores
- Alguns provedores demoram mais para propagar as mudanças

### ❌ Emails caem em spam
- Certifique-se de que o registro DMARC foi adicionado
- Aguarde alguns dias para os servidores de email "aprenderem" que seu domínio é legítimo
- Evite enviar muitos emails de uma vez no início

### ❌ Erro "Domain not verified"
- Aguarde mais tempo (pode levar até 48h)
- Clique em "Verify" novamente no Resend Dashboard
- Verifique se os registros DNS estão corretos

---

## Contato para Suporte

Se precisar de ajuda adicional:
- **Suporte Resend:** https://resend.com/support
- **Email do desenvolvedor:** [seu email]

---

**Última atualização:** Janeiro 2026
