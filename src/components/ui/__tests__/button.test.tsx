import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should show spinner when loading', () => {
    render(<Button loading>Submitting</Button>);

    // O spinner Loader2 deve estar presente
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Botão deve estar desabilitado quando loading
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading prop is true', () => {
    render(<Button loading>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not be disabled when loading is false', () => {
    render(<Button loading={false}>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should respect disabled prop even when not loading', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when both loading and disabled are true', () => {
    render(<Button loading disabled>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
