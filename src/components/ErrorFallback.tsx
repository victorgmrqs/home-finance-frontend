import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Algo deu errado</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
