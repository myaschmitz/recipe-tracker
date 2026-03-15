"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { API_ENDPOINTS } from "@/config/constants";
import { Ingredient } from "@/types/view/models";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IngredientComboboxProps {
  value: string;
  ingredientId?: number | null;
  onValueChange: (name: string, ingredientId: number | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  required?: boolean;
}

const IngredientCombobox = ({
  value,
  ingredientId,
  onValueChange,
  onKeyDown,
  className,
  id,
  required,
}: IngredientComboboxProps) => {
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions based on input
  const fetchSuggestions = useCallback(async (search: string) => {
    if (search.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CANONICAL_INGREDIENTS}?search=${encodeURIComponent(search.trim())}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Error fetching ingredient suggestions:", error);
    }
  }, []);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // When user types, clear the ingredient_id since they're changing the name
    onValueChange(newValue, null);
    setHighlightedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
      if (newValue.trim().length > 0) {
        setIsOpen(true);
      }
    }, 200);
  };

  // Select a suggestion
  const handleSelect = (ingredient: Ingredient) => {
    onValueChange(ingredient.name, ingredient.id);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSuggestions([]);
  };

  // Auto-create ingredient on blur if no match was selected
  const handleBlur = async () => {
    // Small delay so click on suggestion can fire first
    setTimeout(async () => {
      setIsOpen(false);

      const trimmed = value.trim();
      if (trimmed.length === 0 || ingredientId) return;

      // Check if typed value exactly matches a suggestion (case-insensitive)
      const exactMatch = suggestions.find(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase()
      );

      if (exactMatch) {
        onValueChange(exactMatch.name, exactMatch.id);
        return;
      }

      // Auto-create the ingredient
      try {
        const response = await fetch(API_ENDPOINTS.CANONICAL_INGREDIENTS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });

        if (response.ok) {
          const newIngredient = await response.json();
          onValueChange(trimmed, newIngredient.id);
        } else if (response.status === 409) {
          // Already exists — use the existing one
          const data = await response.json();
          if (data.ingredient) {
            onValueChange(data.ingredient.name, data.ingredient.id);
          }
        }
      } catch (error) {
        console.error("Error auto-creating ingredient:", error);
      }
    }, 150);
  };

  // Keyboard navigation
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setHighlightedIndex(-1);
        return;
      }
    }

    // Pass through to parent handler
    onKeyDown?.(e);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (value.trim().length > 0 && suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDownInternal}
        className={cn(className)}
        required={required}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((ingredient, index) => (
            <li
              key={ingredient.id}
              className={cn(
                "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
                index === highlightedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur from firing before click
                handleSelect(ingredient);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span>{ingredient.name}</span>
              {ingredient.category && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {ingredient.category}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IngredientCombobox;
