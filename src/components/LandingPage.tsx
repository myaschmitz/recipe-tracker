"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CookingPot, BookOpen, Users, Search } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CookingPot className="h-12 w-12 text-primary dark:text-[hsl(199,35%,56%)]" />
            <span className="font-bold text-4xl">recipehub</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent dark:from-[hsl(199,35%,56%)] dark:to-[hsl(199,36%,69%)]">
            Welcome to Recipe Hub!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Organize, discover, and share your favorite recipes. Build your personal cookbook and never lose a recipe again.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth?mode=signup">
                  <Button size="lg" className="px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth?mode=login">
                  <Button size="lg" variant="outline" className="px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Organize Recipes</CardTitle>
              <CardDescription>
                Keep all your recipes in one place with tags, collections, and smart organization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Create Collections</CardTitle>
              <CardDescription>
                Group recipes by cuisine, occasion, or dietary preferences for easy access
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Search className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Find Recipes Fast</CardTitle>
              <CardDescription>
                Search by ingredients, tags, or recipe name to find exactly what you're looking for
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Sample Recipes Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CookingPot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Pasta Carbonara</CardTitle>
                </div>
                <CardDescription>
                  Classic Italian comfort food with creamy eggs, cheese, and pancetta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">Italian</span>
                  <span className="bg-secondary px-2 py-1 rounded-full text-xs">Main Course</span>
                </div>
                <p className="text-sm text-muted-foreground">⏱️ 20 mins • 🍽️ 4 servings</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CookingPot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Chocolate Chip Cookies</CardTitle>
                </div>
                <CardDescription>
                  Soft, chewy cookies with the perfect balance of chocolate and vanilla
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">Dessert</span>
                  <span className="bg-secondary px-2 py-1 rounded-full text-xs">Baking</span>
                </div>
                <p className="text-sm text-muted-foreground">⏱️ 25 mins • 🍪 24 cookies</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CookingPot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Caesar Salad</CardTitle>
                </div>
                <CardDescription>
                  Fresh romaine lettuce with homemade dressing and parmesan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">Healthy</span>
                  <span className="bg-secondary px-2 py-1 rounded-full text-xs">Salad</span>
                </div>
                <p className="text-sm text-muted-foreground">⏱️ 15 mins • 🥗 2 servings</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">
                {user ? "Welcome back!" : "Ready to start cooking?"}
              </CardTitle>
              <CardDescription className="text-lg">
                {user 
                  ? "Continue organizing your culinary adventures with Recipe Hub."
                  : "Join thousands of home cooks who trust Recipe Hub to organize their culinary adventures."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="px-8">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth?mode=signup">
                      <Button size="lg" className="px-8">
                        Create Your Account
                      </Button>
                    </Link>
                    <Link href="/auth?mode=login">
                      <Button size="lg" variant="outline" className="px-8">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              {!user && (
                <p className="text-sm text-muted-foreground mt-4">
                  Free forever. No credit card required.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
