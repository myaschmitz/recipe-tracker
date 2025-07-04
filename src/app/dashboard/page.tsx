'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, ChefHat, BookOpen, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access your dashboard.</p>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string, name: string, username: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
            <AvatarFallback>
              {profile ? getInitials(profile.first_name, profile.last_name, profile.name, profile.username) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {profile?.name || profile?.first_name || profile?.username}!
            </h1>
            <p className="text-gray-600">Ready to cook something delicious?</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/recipes/create">
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">recipes created</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">collections organized</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">recipes saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your recipe collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/recipes/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Recipe
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/collections">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Collections
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/profile">
                <Avatar className="h-4 w-4 mr-2">
                  <AvatarFallback className="text-xs">P</AvatarFallback>
                </Avatar>
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Status</span>
              <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                {user.email_confirmed_at ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Account Type</span>
              <Badge variant="outline">Free</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Member Since</span>
              <span className="text-sm text-gray-600">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest recipe activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity yet.</p>
            <p className="text-sm">Start by creating your first recipe!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}