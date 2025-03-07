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
            <div className="mt-2">
              {recipe.tags.map((tag, index) => (
                <Badge key={index}>{tag.name}</Badge>
              ))}
            </div>
          </CardTitle>
          {/* <CardDescription>{recipe.description}</CardDescription> */}
          <CardContent></CardContent>
        </CardHeader>
      </a>
    </Card>
  );
};

export default RecipeCard;
