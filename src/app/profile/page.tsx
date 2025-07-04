"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        try {
            await signOut();
            toast({
                title: "Signed out successfully",
                description: "You have been signed out of your account.",
            });
            router.push("/");
        } catch (error) {
            toast({
                title: "Error signing out",
                description: "There was a problem signing you out.",
                variant: "destructive",
            });
        }
    };

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
                            <span>{user.email}</span>
                        </div>
                        
                        {profile?.created_at && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span>
                                    Member since {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                <Separator />
                
                {/* Account Details Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Information</h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">User ID</span>
                            <span className="font-mono text-sm">{user.id}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Email Status</span>
                            <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
                                {user.email_confirmed_at ? "Verified" : "Unverified"}
                            </Badge>
                        </div>
                        
                        {profile?.location && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Location</span>
                                <span>{profile.location}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <Separator />
                
                {/* Actions Section */}
                <div className="flex gap-3">
                    <Button variant="outline">
                        Edit Profile
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;