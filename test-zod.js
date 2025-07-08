import { recipeFormSchema } from './src/lib/schemas.js';

const testData = {
  "name": "Test Recipe",
  "description": "here",
  "instructions": "<p>test here</p>",
  "ingredients": [
    {
      "name": "fdsafsda",
      "amount": 2,
      "unitId": 9,
      "note": "dsafd"
    },
    {
      "name": "dsaf",
      "amount": 3,
      "unitId": 15,
      "note": "dasf"
    }
  ],
  "tags": [62],
  "collections": [25],
  "prepTime": 10,
  "totalTime": 10
};

try {
  const result = recipeFormSchema.parse(testData);
  console.log("Parsed successfully!");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Parse error:", error);
}
