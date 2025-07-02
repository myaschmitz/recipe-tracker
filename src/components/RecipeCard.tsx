import { Recipe } from "@/types/view/models";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Badge } from "@/components/ui/badge";

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <Card className="card-bg" key={recipe.id}>
      <a href={`/recipes/${recipe.id}`} key={recipe.id}>
        <CardHeader>
          <CardTitle>
            <span>{recipe.name}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {recipe.tags?.map((tag, index) => (
                <Badge key={index}>{tag.name}</Badge>
              ))}
            </div>
            {recipe.collections && recipe.collections.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Collections:</div>
                <div className="flex flex-wrap gap-1">
                  {recipe.collections.map((collection) => (
                    <span
                      key={collection.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {collection.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardTitle>
          {/* <CardDescription>{recipe.description}</CardDescription> */}
          <CardContent></CardContent>
        </CardHeader>
      </a>
    </Card>
  );
};

export default RecipeCard;
