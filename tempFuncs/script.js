import { readdir } from "node:fs/promises";

const recipes = await readdir(import.meta.dir + "\\..\\recipes");
console.log(recipes);