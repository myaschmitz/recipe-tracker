"use client";

import { useState, useEffect } from "react";
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
import { ChevronDown } from "lucide-react";

export default function Admin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { toast } = useToast();

  // Show welcome toast when admin page loads
  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('admin-welcome-shown');
    if (!hasShownWelcome) {
      toast({
        title: "👋 Admin Panel",
        description: "Welcome to the admin panel! Here you can manage test data, backup your database, and perform system operations.",
        variant: "default",
      });
      sessionStorage.setItem('admin-welcome-shown', 'true');
    }
  }, [toast]);

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    
    // Show initial progress toast
    toast({
      title: "🔄 Generating Test Data",
      description: "Clearing existing data and creating test recipes, collections, and tags...",
      variant: "default",
    });
    
    try {
      console.log("Making API request to generate test data...");
      
      const response = await fetch("/api/admin/generate-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error response data:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = {};
        }
        
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Success response:", result);
      
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
      console.log("Making API request to delete all data...");
      
      const response = await fetch("/api/admin/delete-all-data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error response data:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorData = {};
        }
        
        const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Success response:", result);
      
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
      console.log(`Creating ${format.toUpperCase()} backup...`);
      
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
    </div>
  );
}
