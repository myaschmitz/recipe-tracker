-- 1. Change amount from real to numeric, make nullable
ALTER TABLE public.recipe_ingredient
  ALTER COLUMN amount TYPE numeric USING amount::numeric,
  ALTER COLUMN amount DROP NOT NULL;

-- 2. Add position column for explicit ingredient ordering
ALTER TABLE public.recipe_ingredient
  ADD COLUMN position integer NOT NULL DEFAULT 0;

-- Backfill existing rows with sequential positions per recipe
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY recipe_id ORDER BY id) - 1 AS pos
  FROM public.recipe_ingredient
)
UPDATE public.recipe_ingredient ri
SET position = numbered.pos
FROM numbered
WHERE ri.id = numbered.id;

-- 3. Add case-insensitive unique constraint on unit name
CREATE UNIQUE INDEX unit_name_unique ON public.unit (LOWER(name));

-- 4. Add ON DELETE CASCADE to recipe_ingredient.recipe_id FK
ALTER TABLE public.recipe_ingredient
  DROP CONSTRAINT recipe_ingredient_recipe_id_fkey,
  ADD CONSTRAINT recipe_ingredient_recipe_id_fkey
    FOREIGN KEY (recipe_id) REFERENCES public.recipe(id) ON DELETE CASCADE;
