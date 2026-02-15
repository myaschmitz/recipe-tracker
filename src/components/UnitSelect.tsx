"use client";

import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/constants";
import { Unit } from "@/types/view/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface UnitSelectProps {
  selectedUnit: Unit | null;
  onUnitChange: (unit: Unit | null) => void;
  onUnitCreated?: (unit: Unit) => void;
  placeholder?: string;
}

const UnitSelect = ({
  selectedUnit,
  onUnitChange,
  onUnitCreated,
  placeholder = "Select unit...",
}: UnitSelectProps) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitSymbol, setNewUnitSymbol] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.UNITS);
        const data = await response.json();

        if (response.ok) {
          setUnits(data);
        } else {
          console.error(`Error fetching units: ${data.error}`);
          toast({
            title: "Error fetching units",
            description: data.error || "Unknown error",
          });
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        toast({
          title: "Error fetching units",
          description: "Failed to load units",
        });
      }
    };

    fetchUnits();
  }, [toast]);

  const handleUnitSelect = (unit: Unit) => {
    onUnitChange(unit);
    setOpen(false);
  };

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) {
      toast({
        title: "Unit name required",
        description: "Please enter a name for the unit",
      });
      return;
    }

    // Check for existing unit with same name (case-insensitive)
    const existingUnit = units.find(
      u => u.name.toLowerCase() === newUnitName.trim().toLowerCase()
    );

    if (existingUnit) {
      // Auto-select the existing unit instead of creating a duplicate
      onUnitChange(existingUnit);
      setNewUnitName("");
      setNewUnitSymbol("");
      setIsCreating(false);
      setOpen(false);
      toast({
        title: "Unit already exists",
        description: `Selected existing unit "${existingUnit.name}"`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.UNITS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUnitName.trim(),
          symbol: newUnitSymbol.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newUnit = Array.isArray(data) ? data[0] : data;

        // Update units list
        setUnits(prev => [...prev, newUnit]);

        // Notify parent component
        if (onUnitCreated) {
          onUnitCreated(newUnit);
        }

        // Auto-select the newly created unit
        onUnitChange(newUnit);

        // Reset form
        setNewUnitName("");
        setNewUnitSymbol("");
        setIsCreating(false);
        setOpen(false);

        toast({
          title: "Unit created successfully",
          description: `"${newUnit.name}" has been added to your units`,
        });
      } else if (response.status === 409) {
        // Unit already exists server-side — select it
        const existing = data.unit;
        if (existing) {
          onUnitChange(existing);
          setNewUnitName("");
          setNewUnitSymbol("");
          setIsCreating(false);
          setOpen(false);
        }
        toast({
          title: "Unit already exists",
          description: data.error || "A unit with this name already exists",
        });
      } else {
        toast({
          title: "Error creating unit",
          description: data.error || "Failed to create unit",
        });
      }
    } catch (error) {
      console.error("Error creating unit:", error);
      toast({
        title: "Error creating unit",
        description: "Failed to create unit",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewUnitName("");
    setNewUnitSymbol("");
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUnit ? selectedUnit.name : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search units..." />
            <CommandList>
              <CommandEmpty>No units found.</CommandEmpty>
              <CommandGroup>
                {units.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={unit.name}
                    onSelect={() => handleUnitSelect(unit)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedUnit?.id === unit.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span>{unit.name}</span>
                      {unit.symbol && (
                        <span className="text-sm text-muted-foreground">
                          ({unit.symbol})
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="p-2 border-t">
              {!isCreating ? (
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="new-unit-name" className="text-xs">
                      Unit Name
                    </Label>
                    <Input
                      id="new-unit-name"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="e.g., tablespoon, gram, etc."
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-unit-symbol" className="text-xs">
                      Symbol (optional)
                    </Label>
                    <Input
                      id="new-unit-symbol"
                      value={newUnitSymbol}
                      onChange={(e) => setNewUnitSymbol(e.target.value)}
                      placeholder="e.g., tbsp, g, etc."
                      className="h-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateUnit}
                      disabled={isSubmitting}
                      size="sm"
                      className="flex-1"
                    >
                      {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      onClick={handleCancelCreate}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UnitSelect;
