import { readdir } from "node:fs/promises";

const recipePath = import.meta.dir + "\\..\\recipes";
const recipeFileNames = await readdir(recipePath);
for(const recipeFilePath of recipeFileNames){
    const recipeContent = await Bun.file(recipePath + "\\" + recipeFilePath).json();
    const recipes = recipeContent?.recipe ? [recipeContent.recipe] : recipeContent.recipes;
    let updatedFile = {
        "recipeId": recipeFilePath,
        "recipes": recipes.map(({type, ...rest}) => rest),
        "simplifiedRecipes": recipes.map(simplifyRecipe)
    };
    Bun.write(recipePath + "\\" + recipeFilePath, JSON.stringify(updatedFile, null, 2));
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