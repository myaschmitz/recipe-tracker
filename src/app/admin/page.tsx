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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <div className="mb-4">
        <h1 className="text-xl font-semibold mb-2">Test Data</h1>
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
      </div>
    </div>
  );
}
