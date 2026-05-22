    import {readdir} from "node:fs/promises";

    export async function readItems(source) {

        const recipePath = import.meta.dir + "\\..\\neededItems";
        const itemNames = (await readdir(recipePath)).map(fileName => fileName.replace(".json", ""));
        const itemContent = await Promise.all(
            itemNames.map(fileName => Bun.file(recipePath + "\\" + `${fileName}.json`).json())
        );
        const neededItems = itemContent
            .filter(recipeContent => recipeContent.source === source)
            .map(recipeContent => recipeContent.recipeId);

        return {itemNames, itemContent, neededItems}
}