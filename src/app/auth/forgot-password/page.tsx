"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookingPot, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual password reset logic
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
              <CookingPot className="h-8 w-8" />
              <span className="font-bold text-2xl">recipehub</span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to {email}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full"
                  >
                    Try again
                  </Button>
                  <Link href="/auth" className="w-full">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
            <CookingPot className="h-8 w-8" />
            <span className="font-bold text-2xl">recipehub</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter the email address associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-center">
                <Link href="/auth" className="text-sm text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
