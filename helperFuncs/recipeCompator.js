import { readdir } from "node:fs/promises";

const recipePath = import.meta.dir + "\\..\\neededItems";
const recipeFileNames = await readdir(recipePath);
for(const recipeFilePath of recipeFileNames){
    let recipeContent = await Bun.file(recipePath + "\\" + recipeFilePath).json();
    if(!recipeContent.simplifiedRecipes) continue;
    const updatedSimplifiedRecipes = recipeContent.simplifiedRecipes.map((simplifiedRecipe, i) => {
        return ({
        id: `${recipeContent.recipeId}#${i}`,
        ingredients: Object.entries(simplifiedRecipe)
            .filter(([key]) => key !== 'count')
            .map(([ingredient, count]) => ({ ingredient, count })),
        count: simplifiedRecipe.count
    })});

console.log(updatedSimplifiedRecipes)

recipeContent.simplifiedRecipes = updatedSimplifiedRecipes

    // const recipes = recipeContent?.recipe ? [recipeContent.recipe] : recipeContent.recipes;
    // let updatedFile = {
    //     "source": "bazaar",
    //     "recipeId": recipeFilePath.replace(".json", ""),
    //     "recipes": recipes.map(({type, ...rest}) => rest),
    //     "simplifiedRecipes": recipes.map(simplifyRecipe)
    // };
    Bun.write(recipePath + "\\" + recipeFilePath, JSON.stringify(recipeContent, null, 2));
}

function simplifyRecipe(recipe){
    const recipeMap = new Map();
    for(const ingredient of Object.values(recipe)){
        if(!ingredient || typeof ingredient !== "string" || !ingredient.includes(":")) continue;
        const [ingredientName, count] = ingredient.split(":");

        if(!recipeMap.has(ingredientName)) {
            recipeMap.set(ingredientName, parseInt(count));
            continue;
        }
        recipeMap.set(ingredientName, recipeMap.get(ingredientName) + parseInt(count));
    }
    recipeMap.set("count", recipe?.count ?? 1);
    return Object.fromEntries(recipeMap);
}