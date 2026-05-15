import {readdir} from "node:fs/promises";

const bazaarResponse = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
const bazaarProducts = (await bazaarResponse.json()).products;

const recipePath = import.meta.dir + "\\..\\neededItems";
const recipeFileNames = (await readdir(recipePath));
const recipeContents = await Promise.all(
    recipeFileNames.map(fileName => Bun.file(recipePath + "\\" + fileName).json())
);
const desiredRecipes = recipeContents.filter(recipeContent => recipeContent.source === "bazaar").map(recipeContent => recipeContent.recipeId);

console.log(desiredRecipes);