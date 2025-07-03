"use client";

import { useState } from "react";
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

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    
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
      
      toast({
        title: "✅ Success!",
        description: `Test data generated successfully! Created ${result.data?.recipes || 0} recipes, ${result.data?.collections || 0} collections, ${result.data?.tags || 0} tags, and ${result.data?.units || 0} units.`,
        variant: "default",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating test data:", error);
      
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to generate test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    
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
      
      toast({
        title: "✅ Success!",
        description: `All data deleted successfully! Removed ${totalDeleted} records from the database.`,
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting data:", error);
      
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackupDatabase = async (format: 'json' | 'sql') => {
    setIsBackingUp(true);
    
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
      
      toast({
        title: "✅ Backup Created!",
        description: `Database backup successfully exported as ${format.toUpperCase()} file: ${filename}`,
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error creating backup:", error);
      
      toast({
        title: "❌ Backup Failed",
        description: error instanceof Error ? error.message : "Failed to create backup. Please try again.",
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
