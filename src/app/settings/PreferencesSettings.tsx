"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings2, X, Plus } from "lucide-react";

const PreferencesSettings = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newDietaryRestriction, setNewDietaryRestriction] = useState("");
  const [formData, setFormData] = useState({
    language: profile?.language || "en",
    theme_preference: profile?.theme_preference || "system",
    timezone: profile?.timezone || "",
    dietary_restrictions: profile?.dietary_restrictions || [],
  });

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Português" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "zh", label: "中文" },
  ];

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const commonTimezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (UTC-5/4)" },
    { value: "America/Chicago", label: "Central Time (UTC-6/5)" },
    { value: "America/Denver", label: "Mountain Time (UTC-7/6)" },
    { value: "America/Los_Angeles", label: "Pacific Time (UTC-8/7)" },
    { value: "Europe/London", label: "London (UTC+0/1)" },
    { value: "Europe/Paris", label: "Paris (UTC+1/2)" },
    { value: "Europe/Berlin", label: "Berlin (UTC+1/2)" },
    { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
    { value: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
    { value: "Australia/Sydney", label: "Sydney (UTC+10/11)" },
  ];

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDietaryRestriction = () => {
    if (newDietaryRestriction.trim() && !formData.dietary_restrictions.includes(newDietaryRestriction.trim())) {
      setFormData(prev => ({
        ...prev,
        dietary_restrictions: [...prev.dietary_restrictions, newDietaryRestriction.trim()]
      }));
      setNewDietaryRestriction("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.filter(r => r !== restriction)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(formData);
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message || "Failed to update preferences.",
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
          <Settings2 className="h-5 w-5" />
          Preferences
        </CardTitle>
        <CardDescription>
          Customize your language, theme, timezone, and dietary preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleSelectChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme_preference}
                onValueChange={(value) => handleSelectChange("theme_preference", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleSelectChange("timezone", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {commonTimezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Dietary Restrictions</Label>
            <div className="flex gap-2">
              <Input
                value={newDietaryRestriction}
                onChange={(e) => setNewDietaryRestriction(e.target.value)}
                placeholder="Add dietary restriction"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDietaryRestriction();
                  }
                }}
              />
              <Button type="button" onClick={addDietaryRestriction} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.dietary_restrictions.map((restriction) => (
                <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
                  {restriction}
                  <button
                    type="button"
                    onClick={() => removeDietaryRestriction(restriction)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
                Save Preferences
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PreferencesSettings;
