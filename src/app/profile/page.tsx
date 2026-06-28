"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    // Show loading state
    if (loading) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                        <div className="space-y-2">
                            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                    {/* Development helper */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                Loading taking too long? This might be a development auth issue.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold mb-4 text-destructive">Access Denied</h1>
                    <p className="text-muted-foreground">Please sign in to view your profile.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Profile</h1>
                    <p className="text-muted-foreground">Manage your account information and settings</p>
                </div>
                
                {/* User Profile Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold">
                                {profile?.name || `${profile?.first_name} ${profile?.last_name}`.trim() || "User"}
                            </h2>
                            <p className="text-muted-foreground">
                                @{profile?.username || "username"}
                            </p>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <span>{profile?.email || user.email}</span>
                        </div>
                        
                        {profile?.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <span>{profile.phone}</span>
                            </div>
                        )}
                        
                        {profile?.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        
                        {profile?.created_at && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span>
                                    Member since {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {profile?.bio && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                            <p className="text-sm">{profile.bio}</p>
                        </div>
                    )}
                    
                    {profile?.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Dietary Restrictions</h4>
                            <div className="flex flex-wrap gap-1">
                                {profile.dietary_restrictions.map((restriction) => (
                                    <Badge key={restriction} variant="outline" className="text-xs">
                                        {restriction}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <Separator />
                
                {/* Actions Section */}
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/settings')}>
                        Edit Profile
                    </Button>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;