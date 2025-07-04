"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookingPot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Handle query parameters for initial tab state
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    } else {
      // Default to login tab if no mode specified
      setIsLogin(true);
    }
  }, [searchParams]);

  // Function to handle tab switching and update URL
  const handleTabSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode);
    // Update URL without causing a page refresh
    const newMode = loginMode ? 'login' : 'signup';
    const newUrl = `/auth?mode=${newMode}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Safety timeout to ensure loading state is reset
    const timeoutId = setTimeout(() => {
      console.log('Auth timeout - resetting loading state');
      setLoading(false);
    }, 10000); // 10 second timeout

    try {
      if (isLogin) {
        // Sign in logic
        console.log('Attempting to sign in with:', formData.email);
        const result = await signIn(formData.email, formData.password);
        console.log('Sign in result:', result);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        // Redirect to main app after successful sign in
        router.push('/recipes');
      } else {
        // Sign up logic
        console.log('Attempting to sign up with:', formData.email);
        // Validation
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          });
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          toast({
            title: "Error",
            description: "First name and last name are required",
            variant: "destructive",
          });
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        // Create username from first/last name
        const username = `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}`;
        
        const result = await signUp(formData.email, formData.password, username, formData.firstName, formData.lastName);
        console.log('Sign up result:', result);
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast({
        title: "Error",
        description: err.message || `Failed to ${isLogin ? 'sign in' : 'sign up'}`,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
            <CookingPot className="h-8 w-8" />
            <span className="font-bold text-2xl">recipehub</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? "Welcome back! Please sign in to continue." : "Join us and start organizing your recipes!"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Fill in your details to create a new account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="remember-me" className="ml-2 text-sm">
                      Remember me
                    </Label>
                  </div>

                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="text-primary hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative flex items-center justify-center">
                <div className="flex-1 border-t border-border mr-4" />
                <span className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
                <div className="flex-1 border-t border-border ml-4" />
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleTabSwitch(!isLogin)}
                  disabled={loading}
                >
                  {isLogin ? "Create new account" : "Sign in"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}