"use client"; // Add this directive at the top

import { useState, useEffect } from "react";
import SelectInput from "react-select";
import { supabase } from "../lib/supabaseClient"; // Import Supabase client

interface TagOption {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  initialTags?: string[]; // For editing: the initial selected tag IDs
  onTagChange: (tags: string[]) => void; // Callback to parent component when tags change
}

const MultiSelectDropdown = ({
  initialTags = [],
  onTagChange,
}: MultiSelectDropdownProps) => {
  const [tags, setTags] = useState<TagOption[]>([]);
  const [selectedItems, setSelectedItems] = useState<TagOption[]>([]);

  // Fetch tags from Supabase on component mount
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase.from("tag").select("id, name"); // Select 'id' and 'name' columns

      if (error) {
        console.error("Error fetching tags:", error.message);
      } else {
        const options = data.map((tag) => ({
          label: tag.name,
          value: tag.id,
        }));
        setTags(options);

        // Set initial selected items if editing (use initialTags prop)
        if (initialTags.length > 0) {
          const initialSelected = options.filter((option) =>
            initialTags.includes(option.value)
          );
          setSelectedItems(initialSelected);
        }
      }
    };

    fetchTags();
  }, [initialTags]);

  // Handle the change when tags are selected/deselected
  const handleSelectChange = (selected: any) => {
    const selectedValues = selected.map((item: TagOption) => item.value);
    setSelectedItems(selected || []);
    onTagChange(selectedValues); // Send the selected values back to parent component
  };

  return (
    <div>
      <SelectInput
        isMulti
        options={tags}
        value={selectedItems}
        onChange={handleSelectChange}
        getOptionLabel={(e) => e.label}
        getOptionValue={(e) => e.value}
        placeholder="Search and select tags"
        className="w-full"
      />

      <div className="mt-4">
        <h4>Selected Tags:</h4>
        {selectedItems.map((item) => (
          <span key={item.value} className="m-2 p-2 border rounded">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
