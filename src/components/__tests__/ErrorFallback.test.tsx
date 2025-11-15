import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ErrorFallback } from '../ErrorFallback';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetErrorBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error fallback UI', () => {
    render(
      <BrowserRouter>
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
      </BrowserRouter>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado. Por favor, tente novamente.')).toBeInTheDocument();
  });

  it('should show error message in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <BrowserRouter>
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should call resetErrorBoundary when clicking "Tentar novamente"', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
      </BrowserRouter>
    );

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    await user.click(retryButton);

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home and reset when clicking "Ir para Home"', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
      </BrowserRouter>
    );

    const homeButton = screen.getByRole('button', { name: /ir para home/i });
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it('should render retry and home buttons', () => {
    render(
      <BrowserRouter>
        <ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir para home/i })).toBeInTheDocument();
  });
});
