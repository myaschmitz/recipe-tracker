"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Admin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const { toast } = useToast();
  const { profile, loading, user, refreshProfile } = useAuth();
  const router = useRouter();

  // Try to refresh profile when component mounts
  useEffect(() => {
    if (user && !loading && refreshProfile) {
      refreshProfile();
    }
  }, [user, loading, refreshProfile]);

  // Check if user is admin (with delay to allow profile to load)
  useEffect(() => {
    
    // Don't redirect immediately, give some time for profile to load
    const timeoutId = setTimeout(() => {
      if (!loading && (!profile || profile.role !== 'admin')) {
        toast({
          title: "Access Denied",
          description: "You need administrator privileges to access this page.",
          variant: "destructive",
        });
        router.push('/dashboard');
        return;
      }
    }, 1000); // Wait 1 second

    return () => clearTimeout(timeoutId);
  }, [profile, loading, router, toast]);

  // Show welcome toast when admin page loads
  useEffect(() => {
    if (profile?.role === 'admin') {
      const hasShownWelcome = sessionStorage.getItem('admin-welcome-shown');
      if (!hasShownWelcome) {
        toast({
          title: "👋 Admin Panel",
          description: "Welcome to the admin panel! Here you can manage users, test data, and perform system operations.",
          variant: "default",
        });
        sessionStorage.setItem('admin-welcome-shown', 'true');
      }
    }
  }, [toast, profile]);

  // Load users for management
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view users.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Role Updated",
          description: result.message,
          variant: "default",
        });
        loadUsers(); // Refresh user list
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to change user roles.",
          variant: "destructive",
        });
      } else {
        throw new Error('Failed to update role');
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    
    // Show initial progress toast
    toast({
      title: "🔄 Generating Test Data",
      description: "Clearing existing data and creating test recipes, collections, and tags...",
      variant: "default",
    });
    
    try {
      
      const response = await fetch("/api/admin/generate-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = {};
        }
        
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Enhanced success toast with detailed breakdown
      toast({
        title: "🎉 Test Data Generated!",
        description: `Successfully created ${result.data?.recipes || 0} recipes, ${result.data?.collections || 0} collections, ${result.data?.tags || 0} tags, ${result.data?.units || 0} units, and ${result.data?.ingredients || 0} ingredients. Your database is ready for testing!`,
        variant: "default",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating test data:", error);
      
      // Enhanced error toast
      toast({
        title: "❌ Generation Failed",
        description: `Test data generation failed: ${error instanceof Error ? error.message : "Unknown error occurred. Please check your database connection and try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    
    // Show initial warning toast
    toast({
      title: "⚠️ Deleting All Data",
      description: "Permanently removing all recipes, collections, tags, and relationships from your database...",
      variant: "destructive",
    });
    
    try {
      
      const response = await fetch("/api/admin/delete-all-data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = {};
        }
        
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      const totalDeleted = Object.values(result.deletedCounts || {}).reduce((sum: number, count: any) => sum + (count || 0), 0);
      
      // Enhanced success toast with more details
      toast({
        title: "🗑️ All Data Deleted",
        description: `Successfully removed ${totalDeleted} records from your database. All recipes, collections, tags, and relationships have been permanently deleted.`,
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting data:", error);
      
      // Enhanced error toast
      toast({
        title: "❌ Deletion Failed",
        description: `Failed to delete all data: ${error instanceof Error ? error.message : "Unknown error occurred. Some data may still remain in your database."}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackupDatabase = async (format: 'json' | 'sql') => {
    setIsBackingUp(true);
    
    // Show initial toast when backup starts
    toast({
      title: "🔄 Creating Backup",
      description: `Preparing ${format.toUpperCase()} export of your database...`,
      variant: "default",
    });
    
    try {
      
      const response = await fetch("/api/admin/backup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `recipe-tracker-backup-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Enhanced success toast with more details
      toast({
        title: "✅ Backup Complete!",
        description: `Your database has been successfully exported as ${format.toUpperCase()}. File "${filename}" is now downloading.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error creating backup:", error);
      
      // Enhanced error toast with more helpful information
      toast({
        title: "❌ Backup Failed",
        description: `Unable to create ${format.toUpperCase()} backup: ${error instanceof Error ? error.message : "Unknown error occurred. Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if not admin (but be more permissive during loading)
  if (!loading && profile && profile.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center min-h-[200px] flex items-center justify-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Current role: {profile?.role || 'Not authenticated'}
            </p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>
      
      {/* Test Data Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Data</h2>
        <div className="flex gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                Generate Test Data
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle className="text-red-600">⚠️ Warning: Data Will Be Deleted</DialogTitle>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="font-semibold">
                    This action will completely wipe your database and replace it with test data.
                  </div>
                  <div>
                    <strong>All of your existing recipes, collections, and data will be permanently deleted.</strong>
                  </div>
                  <div>
                    This action cannot be undone. Are you sure you want to continue?
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleGenerateTestData}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Yes, Delete All Data & Generate Test Data"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Delete All Data
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle className="text-red-600">⚠️ Danger Zone: Delete All Data</DialogTitle>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="font-semibold">
                    This action will permanently delete ALL data from your database.
                  </div>
                  <div>
                    <strong>This includes all recipes, collections, tags, units, and relationships.</strong>
                  </div>
                  <div className="text-red-600 font-semibold">
                    This action cannot be undone and there is no way to recover the data!
                  </div>
                  <div>
                    Are you absolutely sure you want to continue?
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Database Operations Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Database Operations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Backup Database</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Export your entire database to a file. Choose JSON for easy readability or SQL for database restoration.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isBackingUp}
                  className="flex items-center gap-2"
                >
                  {isBackingUp ? "Creating Backup..." : "📦 Export as..."}
                  {!isBackingUp && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => handleBackupDatabase('json')}
                  disabled={isBackingUp}
                  className="cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    📄 JSON Format
                    <span className="text-xs text-muted-foreground">Human-readable</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleBackupDatabase('sql')}
                  disabled={isBackingUp}
                  className="cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    🗄️ SQL Format
                    <span className="text-xs text-muted-foreground">Database-ready</span>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </h2>
        <div className="space-y-4">
          <Button
            onClick={() => {
              setShowUserManagement(!showUserManagement);
              if (!showUserManagement) {
                loadUsers();
              }
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {showUserManagement ? "Hide" : "Show"} User Roles
          </Button>
          
          {showUserManagement && (
            <div className="bg-card rounded-lg border p-4">
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.email || 'No email'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Change Role
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => updateUserRole(user.id, 'user')}
                            disabled={user.role === 'user'}
                          >
                            User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateUserRole(user.id, 'moderator')}
                            disabled={user.role === 'moderator'}
                          >
                            Moderator
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateUserRole(user.id, 'admin')}
                            disabled={user.role === 'admin'}
                          >
                            Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No users found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
