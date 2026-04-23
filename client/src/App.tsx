import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import ModernHeader from "@/components/ModernHeader";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Home = lazy(() => import("@/pages/Home"));
const Repertorios = lazy(() => import("@/pages/Repertorios"));
const Repertorio = lazy(() => import("@/pages/Repertorio"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogArtigo = lazy(() => import("@/pages/BlogArtigo"));
const Sobre = lazy(() => import("@/pages/Sobre"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MinhaArea = lazy(() => import("@/pages/MinhaArea"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f" }}>
      <ModernHeader />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/repertorios" component={Repertorios} />
            <Route path="/repertorios/:slug" component={Repertorio} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogArtigo} />
            <Route path="/sobre" component={Sobre} />
            <Route path="/minha-area" component={MinhaArea} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
