// Test the schema transformation
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

console.log("Original data:");
console.log(JSON.stringify(testData, null, 2));

// Test the transformation logic
const transformedIngredients = testData.ingredients.map(ingredient => ({
  id: ingredient.id,
  name: ingredient.name,
  amount: ingredient.amount,
  unit_id: ingredient.unitId, // Transform to snake_case
  note: ingredient.note,
}));

console.log("\nTransformed ingredients:");
console.log(JSON.stringify(transformedIngredients, null, 2));

const transformedData = {
  id: testData.id,
  name: testData.name,
  description: testData.description,
  instructions: testData.instructions,
  prep_time: testData.prepTime,
  cook_time: testData.cookTime,
  total_time: testData.totalTime,
  link: testData.link,
  ingredients: transformedIngredients,
  tags: testData.tags,
  collections: testData.collections,
};

console.log("\nFull transformed data:");
console.log(JSON.stringify(transformedData, null, 2));
