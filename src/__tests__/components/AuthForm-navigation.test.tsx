import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '@/components/AuthForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};

const mockToast = {
  toast: jest.fn(),
};

const mockAuth = {
  signIn: jest.fn(),
  signUp: jest.fn(),
};

describe('AuthForm Navigation', () => {
  const mockSearchParams = (mode: string | null) => {
    const searchParams = new URLSearchParams();
    if (mode) {
      searchParams.set('mode', mode);
    }
    return {
      get: jest.fn((key: string) => key === 'mode' ? mode : null),
    };
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    
    // Mock window.history.replaceState
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with login mode when mode=login in URL', () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('login'));
    
    render(<AuthForm />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
  });

  it('should initialize with signup mode when mode=signup in URL', () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('signup'));
    
    render(<AuthForm />);
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Fill in your details to create a new account')).toBeInTheDocument();
  });

  it('should default to login mode when no mode specified', () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams(null));
    
    render(<AuthForm />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
  });

  it('should update URL when switching between login and signup', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('login'));
    
    render(<AuthForm />);
    
    // Initially on login
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    
    // Switch to signup
    const switchButton = screen.getByText('Create new account');
    fireEvent.click(switchButton);
    
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/auth?mode=signup');
    });
  });

  it('should show first name and last name fields only in signup mode', () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('signup'));
    
    render(<AuthForm />);
    
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('should show forgot password link only in login mode', () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('login'));
    
    render(<AuthForm />);
    
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('should not show forgot password link in signup mode', () => {
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('signup'));
    
    render(<AuthForm />);
    
    expect(screen.queryByText('Forgot your password?')).not.toBeInTheDocument();
  });

  it('should update button text based on mode', () => {
    // Test login mode
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('login'));
    const { rerender } = render(<AuthForm />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create new account')).toBeInTheDocument();

    // Test signup mode
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams('signup'));
    rerender(<AuthForm />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Sign in instead')).toBeInTheDocument();
  });
});
