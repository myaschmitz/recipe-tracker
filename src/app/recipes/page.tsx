"use client";

import { Recipe, Tag, Unit } from "@/types/view/models";
import { RecipeSchema } from "@/types/database/models";
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await fetch("/api/recipes");
      const data = await response.json();

      if (response.ok) {
        console.log(data);
      }

      setRecipes(
        data.map((recipe: RecipeSchema) => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          createdAt: recipe.created_at,
          updatedAt: recipe.updated_at,
          instructions: recipe.instructions,
          ingredients: {},
          tags: [],
        }))
      );
    };

    const fetchUnits = async () => {
      const response = await fetch("/api/units");
      const data = await response.json();

      if (response.ok) {
        const formattedUnits = data.map((d: Unit) => {
          return { id: d.id, name: d.name };
        });
        setUnits(formattedUnits);
      } else {
        console.error(`Error fetching units: ${data.error}`);
      }
    };

    const fetchTags = async () => {
      const response = await fetch("/api/tags");
      const data = await response.json();

      if (response.ok) {
        const formattedTags = data.map((d: Tag) => {
          return { id: d.id, name: d.name };
        });

        setTags(formattedTags);
      } else {
        console.error(`Error fetching tags: ${data.error}`);
      }
    };

    fetchRecipes();
    fetchUnits();
    fetchTags();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1>
      <div className="mb-4">
        <Accordion type="single" collapsible>
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
                      {/* <TableCell>
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
                    </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <a href={`/recipes/${recipe.id}`} key={recipe.id}>
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
                <CardContent>
                  {/* <h1 className="text-md font-bold">Instructions</h1>
                <div>{parse(recipe.instructions)}</div> */}
                </CardContent>
              </CardHeader>{" "}
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
