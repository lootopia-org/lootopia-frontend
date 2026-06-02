import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Mock framer-motion - omit framer-specific props
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, whileHover, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Button component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Button isLoading>Submit</Button>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when props.disabled is true', () => {
    render(<Button disabled>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-primary');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-danger');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
  });
});

describe('Input component', () => {
  it('renders input with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-danger');
  });

  it('handles onChange', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('Card component', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('LoadingSpinner component', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(document.querySelector('.w-8')).toBeInTheDocument();

    rerender(<LoadingSpinner size="md" />);
    expect(document.querySelector('.w-12')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(document.querySelector('.w-16')).toBeInTheDocument();
  });

  it('renders full screen spinner', () => {
    render(<LoadingSpinner fullScreen />);
    
    const container = document.querySelector('.fixed');
    expect(container).toBeInTheDocument();
  });
});
