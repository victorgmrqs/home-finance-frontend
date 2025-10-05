import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TransactionsPageInfiniteScroll } from "./components/TransactionsPageInfiniteScroll";
import { LocaisPage } from "./components/LocaisPage";
import { UsuariosPage } from "./components/UsuariosPage";
import { PaineisPage } from "./components/PaineisPage";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/paineis" element={<PaineisPage />} />
          <Route path="/" element={<TransactionsPageInfiniteScroll />} />
          <Route path="/locais" element={<LocaisPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
