"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Lock } from "lucide-react";

const PrivacySettings = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(profile?.is_private ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({ is_private: isPrivate });
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating privacy settings",
        description: error.message || "Failed to update privacy settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control who can see your profile and recipes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private-profile" className="text-base">
                  Private Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, your profile and recipes will only be visible to you. 
                  Other users won&apos;t be able to see your content in public listings.
                </p>
              </div>
              <Switch
                id="private-profile"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">What does this mean?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your recipes won&apos;t appear in public recipe listings</li>
              <li>• Other users can&apos;t search for your recipes</li>
              <li>• Your profile won&apos;t be visible to other users</li>
              <li>• You can still share direct links to your recipes if needed</li>
            </ul>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Privacy Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
