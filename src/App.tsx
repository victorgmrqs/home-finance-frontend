import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { PainelProvider } from "./contexts/PainelContext";
import { LoginPage } from "./components/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./components/Dashboard";
import { TransactionsPageInfiniteScroll } from "./components/TransactionsPageInfiniteScroll";
import { LocaisPage } from "./components/LocaisPage";
import { UsuariosPage } from "./components/UsuariosPage";
import { PaineisPage } from "./components/PaineisPage";
import { CategoriasPage } from "./components/CategoriasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <PainelProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/usuarios" element={<ProtectedRoute><UsuariosPage /></ProtectedRoute>} />
              <Route path="/paineis" element={<ProtectedRoute><PaineisPage /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><TransactionsPageInfiniteScroll /></ProtectedRoute>} />
              <Route path="/locais" element={<ProtectedRoute><LocaisPage /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute><CategoriasPage /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PainelProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
