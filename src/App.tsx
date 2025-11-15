import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { UserProvider } from "./contexts/UserContext";
import { UserErrorBoundary } from "./components/UserErrorBoundary";
import { ErrorFallback } from "./components/ErrorFallback";
import { LoginPage } from "./components/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./components/Dashboard";
import { TransactionsPageInfiniteScroll } from "./components/TransactionsPageInfiniteScroll";
import { LocaisPage } from "./components/LocaisPage";
import { UsuariosPage } from "./components/UsuariosPage";
import { PaineisPage } from "./components/PaineisPage";
import { CategoriasPage } from "./components/CategoriasPage";
import { ApiStatusBanner } from "./components/ApiStatusBanner";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3, // Retry até 3 vezes em caso de falha
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
    },
  },
});

// Error logging function
const logError = (error: Error, errorInfo: { componentStack: string }) => {
  console.error('Uncaught error:', error, errorInfo);

  // In production, you could send this to an error tracking service like Sentry
  // Example:
  // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
};

const AppContent = () => {
  useOnlineStatus(); // Monitora status de conexão e exibe toasts

  return (
    <>
      <ApiStatusBanner />
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
    </>
  );
};

const App = () => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={logError}
    onReset={() => {
      // Clear React Query cache to reset app state
      queryClient.clear();
      // The ErrorFallback component handles navigation using useNavigate
    }}
  >
    <QueryClientProvider client={queryClient}>
      <UserErrorBoundary>
        <UserProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </UserProvider>
      </UserErrorBoundary>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
