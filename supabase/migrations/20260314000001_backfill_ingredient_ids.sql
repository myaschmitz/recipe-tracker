-- Backfill: insert distinct ingredient names from existing recipes into the ingredient table,
-- then link recipe_ingredient rows to their canonical ingredient.

-- Step 1: Insert unique ingredient names that don't already exist
-- Use DISTINCT ON (LOWER(...)) to avoid conflicts from case variations like "Arborio Rice" vs "arborio rice"
INSERT INTO ingredient (name)
SELECT DISTINCT ON (LOWER(TRIM(name))) TRIM(name)
FROM recipe_ingredient
WHERE TRIM(name) != ''
  AND NOT EXISTS (
    SELECT 1 FROM ingredient i WHERE LOWER(i.name) = LOWER(TRIM(recipe_ingredient.name))
  )
ORDER BY LOWER(TRIM(name)), name;

-- Step 2: Set ingredient_id on recipe_ingredient rows that don't have one yet
UPDATE recipe_ingredient ri
SET ingredient_id = i.id
FROM ingredient i
WHERE LOWER(TRIM(ri.name)) = LOWER(i.name)
  AND ri.ingredient_id IS NULL;
