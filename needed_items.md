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
clear up minionSetup structure
Fuel is calculated wrong based on collectionIntervalHours, just math.ceil intervalhr/24
resolveItemPrice has no circular prevention!!!
add ceramic into profit calculations

Calculator for free will
Calculations for sustainability of eyedrops
Compress information in minionSetup - declare states so we can store information like mithrilInfusion, freeWill in single bits.

Cost of slots unlocking - LATER after having base platform and already working setup optimizer, offered in base and linked to optimizer
Predicted xp
required collections

Calculate fastest way to make fuel based off amount(crafting)
Predicted fill up time

Based of costs and profit differences calculate most optimal upgrade path
Add providing current setup
Think wether it is linear or is there some minmaxing to do
First assume already having minimal amounts of minions for full speed bonus
Calculator for estimated time till upgrade - include checking only once per certain period

Start making a website
Perhaps add some database with drizzle for different users
Optimize for SEO
Maximize lighthouse etc

Find a way to compact minion setup footprint
Optimize everything, even like storage of neededItems.