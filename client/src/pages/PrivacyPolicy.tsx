import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl">
        <div className="container py-8 md:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container max-w-3xl py-12 md:py-16">
        <div className="prose-louvamais space-y-8 text-foreground/80">
          {/* Introdução */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introdução</h2>
            <p>
              O LouvaMais ("nós", "nosso" ou "nos") opera o site <strong>https://louvamais.com</strong> (o "Site"). Esta página informa você sobre nossas políticas sobre a coleta, uso e divulgação de dados pessoais quando você usa nosso Site e as escolhas que você tem associadas a esses dados.
            </p>
            <p>
              Utilizamos seus dados para fornecer e melhorar o Site. Ao usar o Site, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>
          </section>

          {/* Informações que Coletamos */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Dados Pessoais</h3>
            <p>Quando você se cadastra no Site, coletamos as seguintes informações:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Senha (armazenada de forma segura com hash criptográfico)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Dados de Navegação</h3>
            <p>Coletamos automaticamente informações sobre sua interação com o Site:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Endereço IP</li>
              <li>Tipo de navegador e versão</li>
              <li>Páginas visitadas e tempo gasto</li>
              <li>Localização aproximada (país/região)</li>
              <li>Dados de referência (como você chegou ao Site)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.3 Cookies e Tecnologias Similares</h3>
            <p>
              Usamos cookies e tecnologias similares para rastrear atividades no Site e manter certas informações. Cookies são arquivos com pequenas quantidades de dados que podem incluir um identificador único anônimo.
            </p>
          </section>

          {/* Google Analytics */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Google Analytics</h2>
            <p>
              O Site usa <strong>Google Analytics</strong>, um serviço de análise web fornecido pelo Google, Inc. ("Google"). O Google Analytics usa cookies para ajudar o Site a analisar como os usuários usam o Site.
            </p>
            <p>
              As informações geradas pelo cookie sobre seu uso do Site (incluindo seu endereço IP) serão transmitidas e armazenadas pelo Google em servidores nos Estados Unidos. O Google usará essas informações para fins de avaliação do seu uso do Site, compilação de relatórios sobre a atividade do Site e prestação de outros serviços relacionados à atividade do Site e ao uso da Internet.
            </p>
            <p>
              Você pode desabilitar o Google Analytics instalando a <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">extensão de desativação do Google Analytics</a>.
            </p>
          </section>

          {/* Google AdSense */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Google AdSense</h2>
            <p>
              O Site usa <strong>Google AdSense</strong> para exibir anúncios. O Google AdSense e seus parceiros usam cookies para servir anúncios com base no seu histórico de navegação anterior.
            </p>
            <p>
              O Google pode exibir anúncios em sites de parceiros com base no seu perfil de interesse. Você pode desabilitar a publicidade personalizada visitando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">configurações de anúncios do Google</a>.
            </p>
            <p>
              Para mais informações sobre como o Google coleta e usa dados, consulte a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Política de Privacidade do Google</a>.
            </p>
          </section>

          {/* Uso de Dados */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Como Usamos Seus Dados</h2>
            <p>O LouvaMais usa os dados coletados para:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Fornecer, manter e melhorar o Site</li>
              <li>Enviar notificações e atualizações (se você consentir)</li>
              <li>Responder a suas consultas e solicitações</li>
              <li>Analisar o uso do Site e melhorar a experiência do usuário</li>
              <li>Detectar e prevenir atividades fraudulentas</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          {/* Compartilhamento de Dados */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Compartilhamento de Dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. No entanto, podemos compartilhar dados com:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Google Analytics e Google AdSense</strong> — para análise e publicidade (conforme descrito acima)</li>
              <li><strong>Provedores de serviço</strong> — que nos ajudam a operar o Site (hospedagem, suporte técnico)</li>
              <li><strong>Autoridades legais</strong> — quando exigido por lei</li>
            </ul>
          </section>

          {/* Segurança */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Segurança de Dados</h2>
            <p>
              Implementamos medidas de segurança apropriadas para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Criptografia SSL/HTTPS para toda comunicação</li>
              <li>Hash criptográfico para senhas (bcrypt)</li>
              <li>Acesso restrito a dados pessoais</li>
              <li>Firewalls e proteção contra malware</li>
            </ul>
            <p className="mt-4">
              No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro. Portanto, não podemos garantir segurança absoluta.
            </p>
          </section>

          {/* Retenção de Dados */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Retenção de Dados</h2>
            <p>
              Retemos seus dados pessoais pelo tempo necessário para fornecer o Site e cumprir as obrigações legais. Você pode solicitar a exclusão de seus dados a qualquer momento entrando em contato conosco.
            </p>
          </section>

          {/* Direitos do Usuário */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Seus Direitos</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD) e regulamentações similares, você tem o direito de:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Acessar</strong> seus dados pessoais</li>
              <li><strong>Corrigir</strong> dados imprecisos ou incompletos</li>
              <li><strong>Excluir</strong> seus dados (direito ao esquecimento)</li>
              <li><strong>Portar</strong> seus dados para outro serviço</li>
              <li><strong>Opor-se</strong> ao processamento de seus dados</li>
              <li><strong>Revogar</strong> seu consentimento a qualquer momento</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer desses direitos, entre em contato conosco usando as informações na seção "Contato".
            </p>
          </section>

          {/* Links Externos */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Links Externos</h2>
            <p>
              O Site pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade desses sites. Recomendamos que você revise a política de privacidade de qualquer site de terceiros antes de fornecer informações pessoais.
            </p>
          </section>

          {/* Alterações na Política */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Alterações Nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outras razões operacionais, legais ou regulatórias. Notificaremos você sobre alterações significativas publicando a nova política no Site e atualizando a data de "Última atualização" no topo desta página.
            </p>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato conosco:
            </p>
            <div className="bg-card/50 border border-border/50 rounded-lg p-6 mt-4">
              <p className="font-semibold text-foreground mb-2">LouvaMais</p>
              <p className="text-sm">E-mail: <a href="mailto:louvamais590@gmail.com" className="text-purple-400 hover:text-purple-300 underline">louvamais590@gmail.com</a></p>
              <p className="text-sm">Website: <a href="https://louvamais.com" className="text-purple-400 hover:text-purple-300 underline">https://louvamais.com</a></p>
            </div>
          </section>

          {/* Conformidade */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">13. Conformidade Legal</h2>
            <p>
              Esta Política de Privacidade está em conformidade com:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>LGPD</strong> — Lei Geral de Proteção de Dados (Brasil)</li>
              <li><strong>GDPR</strong> — Regulamento Geral sobre Proteção de Dados (União Europeia)</li>
              <li><strong>Políticas do Google AdSense</strong></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
