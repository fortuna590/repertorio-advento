import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Repertorio from "./pages/Repertorio";
// import Stats from "./pages/Stats"; // Replaced with Estatisticas.tsx
// import About from "./pages/About"; // Replaced with Sobre.tsx
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import DonationSuccess from "./pages/DonationSuccess";
// import Produtos from "./pages/Produtos"; // Replaced with Loja.tsx
import MontarRepertorio from "./pages/MontarRepertorio";
import Blog from "./pages/Blog";
import BlogArtigo from "./pages/BlogArtigo";
import BlogAdmin from "./pages/BlogAdmin";
import Checkout from "./pages/Checkout";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoCancelado from "./pages/PagamentoCancelado";
import Dashboard from "./pages/Dashboard";
import Depoimentos from "./pages/Depoimentos";
import DepoimentosAdmin from "./pages/DepoimentosAdmin";
import Sobre from "./pages/Sobre";
import Estatisticas from "./pages/Estatisticas";
import Loja from "./pages/Loja";
// import Liturgia from "./pages/Liturgia"; // Temporarily disabled due to production errors
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import MinhasFavoritas from "./pages/MinhasFavoritas";
import WhatsAppButton from "./components/WhatsAppButton";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/repertorio"} component={Repertorio} />
      <Route path={"/estatisticas"} component={Estatisticas} />
      <Route path={"/contato"} component={Contact} />
      <Route path={"/doacao"} component={Donate} />
      <Route path={"/doacao/sucesso"} component={DonationSuccess} />
      <Route path={"/montar-repertorio"} component={MontarRepertorio} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogArtigo} />
      <Route path={"/blog-admin"} component={BlogAdmin} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/pagamento-sucesso"} component={PagamentoSucesso} />
      <Route path={"/pagamento-cancelado"} component={PagamentoCancelado} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/depoimentos"} component={Depoimentos} />
      <Route path={"/depoimentos-admin"} component={DepoimentosAdmin} />
      <Route path={"/sobre"} component={Sobre} />
      <Route path={"/estatisticas"} component={Estatisticas} />
      <Route path={"/loja"} component={Loja} />
      {/* <Route path={"/liturgia"} component={Liturgia} /> */} {/* Temporarily disabled due to production errors */}
      <Route path={"/login"} component={Login} />
      <Route path={"/cadastro"} component={Cadastro} />
      <Route path={"/perfil"} component={Perfil} />
      <Route path={"/minhas-favoritas"} component={MinhasFavoritas} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
