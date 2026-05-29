# Used Items
#### B - Bazaar | A - Auction House | C - further craftable

## Fueling
Capsaicin Eyedrops - C !Chilli Pepper III Collection!
 - Enchanted Carrot B
 - Exportable Carrots B
 - Chilli Pepper - B
 - Water Hydra Head - A

Inferno Minion Fuel - A
 - Gabagool Distillate - B
 - Inferno Fuel Block - B
 - Hypergolic Gabagool - B

Hypergolic Gabagool - B | C
 - Heavy Gabagool - B
 - Sulphuric Coal - B

Heavy Gabagool - B | C
 - Fuel Gabagool - B
 - Sulpuric coal - B

Fuel Gabagool - B | C
 - Very Crude Gabagool - B
 - Sulphuric Coal - B

Sulphuric Coal - B | C
 - Enchanted Coal - B
 - Enchanted Sulphur - B

## Setup
Inferno Minion - C | MAH
 - Lower Tier Minion + Molten Powder | Derelic Ashe New B
 - Inferno Vertex - B
 - Inferno Apex - B

Molten Powder - B
 - Derelic Ashe - B
 - Amalgamated Crimsonite New - B

Amalgamated Crimsonite New - B

Storage - B | C !!!
 - Minion Storage X-pander - A
 - Enchanted Oak Log

 Super Compactor 3000 - B

 Flycatcher - B | C !Spider Slayer 6!
  - Tarantula Silk - B
  - Fly Swatter - B

Beacon - A

Power Crystal - B

Scorched Power Crystal - B

## Outputs
Very Crude Gabagool - B
Chilli Pepper - B
Re-heated Gummy Polar Bear - C
Inferno Vertex - B
Inferno Apex - B - Double for T10|T11
Gabagool the fish - A
Reaper Pepper - B

# TODO
Depending on the amount of items, change ah prices to match or just use LBIN or some avg
Caching of auction house
Optimize the checkPricing to not repeat calculations
Figure out good object structure for nested recipes and alternative crafting routes - Fix current issues
Inferno Minion crafting prices are all wrong - it only takes buy price into consideration. Maybe crafting in prices should be a recursive tree
Migrate to TypeScript for easier handling of the structure

Example:
{
  itemId: "INFERNO_HYPERGOLIC_CRUDE_GABAGOOL",
  cheapest: {
    type: "craft",
    recipeId: "INFERNO_HYPERGOLIC_CRUDE_GABAGOOL#0",
    cost: 42000,
    ingredients: {
      "CRUDE_GABAGOOL_DISTILLATE": {
        itemId: "CRUDE_GABAGOOL_DISTILLATE",
        cheapest: { type: "buy_bazaar", cost: 1200 },
        alternatives: [...]
      },
      "INFERNO_FUEL_BLOCK": { ... }, // nested
      "HYPERGOLIC_GABAGOOL": { ... }
    }
  },
  alternatives: [
    { type: "buy_ah", cost: 55000 },
    { type: "craft", recipeId: "...", cost: 42000, ingredients: {...} }
  ]
}