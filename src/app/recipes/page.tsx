"use client";

import { Recipe, RecipeTag, Tag } from "@/types/view/models";
import { RecipeSchema, RecipeTagSchema } from "@/types/database/models";
import React, { useState, useEffect } from "react";
import RecipeCard from "@/components/RecipeCard";

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    // TODO: create structure that's based off of tags in database
    // so it doesn't need to make a request to the database every time

    const fetchData = async () => {
      const recipeResponse = await fetch("/api/recipes");
      const recipeData = await recipeResponse.json();
      const recipeTagResponse = await fetch("/api/recipe-tags");
      const recipeTagData = await recipeTagResponse.json();
      const tagResponse = await fetch("/api/tags");
      const tagData = await tagResponse.json();
      const formattedTags = tagData.map((d: Tag) => {
        return { id: d.id, name: d.name };
      });

      if (!tagResponse.ok) {
        console.error(`Error fetching tags: ${tagData.error}`);
      }

      if (!recipeResponse.ok) {
        console.error("Error fetching recipes.");
      }

      if (!recipeTagResponse.ok) {
        console.error(`Error fetching recipe tags: ${recipeTagData.error}`);
      }

      const recipeTagsMap = recipeTagData.map((d: RecipeTagSchema) => {
        return { tag_id: d.tag_id, recipe_id: d.recipe_id };
      });

      setRecipes(
        recipeData.map((recipe: RecipeSchema) => {
          const recipeTagRelations = recipeTagsMap.filter(
            (relation: RecipeTagSchema) => relation.recipe_id === recipe.id
          );

          const recipeTags = recipeTagRelations
            .map((relation: RecipeTagSchema) => {
              // Find the full tag object using the tag_id from the relation
              return formattedTags.find((tag) => tag.id === relation.tag_id);
            })
            .filter(Boolean);
          return {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            tags: recipeTags,
          };
        })
      );
    };

    fetchData();
  }, []);

  if (!recipes) {
    return (
      <div className="container mx-auto p-4 text-lg font-bold">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1>
      <div className="mb-4">
        {/* <Accordion type="single" collapsible>
          <AccordionItem value="recipe-quick-access">
            <AccordionTrigger>Recipe quick access table</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Collections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell>
                        <a
                          href={`/recipes/${recipe.id}`}
                          key={recipe.id}
                          className="hover:underline"
                        >
                          {recipe.name}
                        </a>
                      </TableCell>
                      <TableCell>{recipe.description}</TableCell>
                      <TableCell>
                      {recipe.ingredients
                        .map(
                          (ingredient) =>
                            `${ingredient.name} (${ingredient.amount} ${
                              units.find(
                                (unit) => unit.id === ingredient.unit.id
                              )?.name || ""
                            })`
                        )
                        .join(", ")}
                    </TableCell>
                    <TableCell>{recipe.instructions}</TableCell>
                    <TableCell>
                      {recipe.tags
                        .map(
                          (tag) => `${tags.find((t) => t.id === tag.id)?.name}`
                        )
                        .join(", ")}
                    </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion> */}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Recipes;
