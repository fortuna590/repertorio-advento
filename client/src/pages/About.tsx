import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Church, Users, Calendar, Heart, Target, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Repertório
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-primary/20 shadow-lg">
              <img 
                src={APP_LOGO} 
                alt="LouvaMais Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Sobre o LouvaMais
              </h1>
              <p className="text-muted-foreground mt-1">
                Church Solutions - Soluções tecnológicas para igrejas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12 space-y-12">
        {/* Missão */}
        <section className="max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-primary" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                O <span className="font-semibold text-primary">LouvaMais</span> nasceu com o propósito de{" "}
                <span className="font-semibold text-foreground">criar soluções tecnológicas para as igrejas</span>, 
                com foco principal na <span className="font-semibold text-foreground">gestão das paróquias</span>.
              </p>
              <p className="text-lg leading-relaxed">
                A ideia inicial foi criar um sistema de <span className="font-semibold text-foreground">gestão de escalas para corais de música</span>, 
                mas percebemos uma fragilidade maior: <span className="font-semibold text-foreground">movimentos e pastorais que não têm como se organizar</span> com 
                suas equipes, as pessoas que participam e ajustar as reuniões de forma tecnológica e fácil.
              </p>
              <p className="text-lg leading-relaxed">
                A maioria das pessoas são <span className="font-semibold text-foreground">leigas no aspecto tecnológico</span>, 
                e é aí que a solução do LouvaMais entra: oferecendo ferramentas{" "}
                <span className="font-semibold text-foreground">simples, intuitivas e eficazes</span> para a gestão pastoral.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Soluções */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Nossas Soluções
            </h2>
            <p className="text-muted-foreground">
              Tecnologia a serviço da evangelização
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gestão de Escalas */}
            <Card className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/20 w-fit mb-2">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Gestão de Escalas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organize escalas de corais, ministérios e equipes de forma simples e eficiente.
                </p>
              </CardContent>
            </Card>

            {/* Gestão de Equipes */}
            <Card className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/20 w-fit mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Gestão de Equipes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cadastre participantes, organize grupos e acompanhe a participação de cada membro.
                </p>
              </CardContent>
            </Card>

            {/* Organização de Reuniões */}
            <Card className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/20 w-fit mb-2">
                  <Church className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Reuniões Pastorais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Agende e gerencie reuniões de movimentos e pastorais com facilidade.
                </p>
              </CardContent>
            </Card>

            {/* Repertório Litúrgico */}
            <Card className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/20 w-fit mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Repertório Litúrgico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acesse repertórios organizados por tempo litúrgico com links para YouTube e cifras.
                </p>
              </CardContent>
            </Card>

            {/* Comunicação */}
            <Card className="hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/20 w-fit mb-2">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Comunicação Simples</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ferramentas de comunicação pensadas para pessoas sem conhecimento técnico.
                </p>
              </CardContent>
            </Card>

            {/* Em breve */}
            <Card className="hover:border-primary/50 transition-all border-dashed">
              <CardHeader>
                <div className="p-3 rounded-lg bg-muted w-fit mb-2">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-muted-foreground">Em Breve</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Novas funcionalidades estão sendo desenvolvidas para melhor servir sua comunidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30">
            <CardContent className="py-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <img 
                    src={APP_LOGO} 
                    alt="LouvaMais Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  Quer saber mais?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Entre em contato conosco e descubra como o LouvaMais pode ajudar 
                  sua paróquia, movimento ou pastoral a se organizar melhor.
                </p>
              </div>
              <Link href="/contato">
                <Button size="lg" className="gap-2">
                  <Heart className="w-5 h-5" />
                  Entrar em Contato
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <div className="text-center space-y-4">
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Uma produção de{" "}
                <span className="font-semibold text-primary">LouvaMais - Church Solutions</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                © 2025 LouvaMais. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
