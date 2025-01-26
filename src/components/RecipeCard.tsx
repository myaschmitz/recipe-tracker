import { Recipe } from "@/types/view/models";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <Card className="card-bg" key={recipe.id}>
      <a href={`/recipes/${recipe.id}`} key={recipe.id}>
        <CardHeader>
          <CardTitle>{recipe.name}</CardTitle>
          {/* <CardDescription>{recipe.description}</CardDescription> */}
          <CardContent></CardContent>
        </CardHeader>
      </a>
    </Card>
  );
};

export default RecipeCard;
