import { world, Items, ItemStack, MinecraftBlockTypes, MinecraftEnchantmentTypes, MinecraftItemTypes } from "mojang-minecraft";
import { getIsActive, getMaxChains } from "./option";


function getEquippedItem(player) {
  return player.getComponent("inventory").container.getItem(player.selectedSlot);
}

/* option:
    -1: silktouch
    0: default
    1: fortune-1
    2: fortune-2
    3: fortune-3
*/

function optionFrom(item) {
  let enchantmentList = item.getComponent("enchantments").enchantments;
  if (enchantmentList.hasEnchantment(MinecraftEnchantmentTypes.silkTouch)) {
    return -1;
  }
  if (enchantmentList.hasEnchantment(MinecraftEnchantmentTypes.fortune)) {
    return enchantmentList.getEnchantment(MinecraftEnchantmentTypes.fortune).level;
  }
  return 0;
}


function dropItem(dimension, blockLocation, itemType, amount) {
  let item = new ItemStack(itemType, amount);
  dimension.spawnItem(item, blockLocation);
}

function dropOre(dimension, blockLocation, blockType, option, itemType, amount) {
  switch (option) {
    case -1:
      itemType = Items.get(blockType.id);
      amount = 1;
      break;
    
    case 0:
      break;
    
    default:
      amount *= Math.max(Math.floor(Math.random() * (option + 2)), 1);
  }
  dropItem(dimension, blockLocation, itemType, amount);
}


function dropCoal(dimension, blockLocation, blockType, option) {
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.coal, 1);
}

function dropLapis(dimension, blockLocation, blockType, option) {
  let amount = Math.floor(Math.random() * 6) + 4;
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.lapisLazuli, amount);
}

function dropCopper(dimension, blockLocation, blockType, option) {
  let amount = Math.floor(Math.random() * 4) + 2;
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.rawCopper, amount);
}

function dropIron(dimension, blockLocation, blockType, option) {
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.rawIron, 1);
}

function dropGold(dimension, blockLocation, blockType, option) {
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.rawGold, 1);
}

function dropRedstone(dimension, blockLocation, blockType, option) {
  let itemType = MinecraftItemTypes.redstone;
  let amount = 1;
  if (option === -1) {
    itemType = Items.get(blockType.id.replace("lit_", ""));
  } else {
    amount = Math.floor(Math.random() * (option + 2)) + 4;
  }
  dropItem(dimension, blockLocation, itemType, amount);
}

function dropDiamond(dimension, blockLocation, blockType, option) {
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.diamond, 1);
}

function dropEmerald(dimension, blockLocation, blockType, option) {
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.emerald, 1);
}

function dropQuartz(dimension, blockLocation, blockType, option) {
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.quartz, 1);
}

function dropNetherGold(dimension, blockLocation, blockType, option) {
  let amount = Math.floor(Math.random() * 5) + 2;
  dropOre(dimension, blockLocation, blockType, option, MinecraftItemTypes.goldNugget, amount);
}


function mineBlock(dimension, blockLocation, blockTypeSet, drop, option) {
  let block = dimension.getBlock(blockLocation);
  let blockType = block.type;
  if (! blockTypeSet.has(blockType))
    return false;
  block.setType(MinecraftBlockTypes.air);
  drop(dimension, blockLocation, blockType, option);
  return true;
}

function spreadLocation(blockLocationSet, blockLocation) {
  blockLocationSet.add(blockLocation.offset(1, 0, 0));
  blockLocationSet.add(blockLocation.offset(-1, 0, 0));
  blockLocationSet.add(blockLocation.offset(0, 1, 0));
  blockLocationSet.add(blockLocation.offset(0, -1, 0));
  blockLocationSet.add(blockLocation.offset(0, 0, 1));
  blockLocationSet.add(blockLocation.offset(0, 0, -1));
}

function spreadMine(dimension, startBlockLocation, blockTypeSet, drop, tool) {
  let countChains = 0;
  let maxChains = getMaxChains();
  let blockLocationSet;
  let nextBlockLocationSet = new Set();
  spreadLocation(nextBlockLocationSet, startBlockLocation);
  
  let option = optionFrom(tool);
  
  while (countChains < maxChains) {
    countChains++;
    blockLocationSet = nextBlockLocationSet;
    nextBlockLocationSet = new Set();
    
    for (let blockLocation of blockLocationSet) {
      let wasOre = mineBlock(dimension, blockLocation, blockTypeSet, drop, option);
      if (wasOre) {
        spreadLocation(nextBlockLocationSet, blockLocation);
      }
    }
    
    if (nextBlockLocationSet.size === 0)
      break;
  }
}


class OreData {
  constructor(oreSet, pickaxeSet, drop) {
    this.oreSet = oreSet;
    this.pickaxeSet = pickaxeSet;
    this.drop = drop;
  }

  testCase(blockType, tool) {
    return this.oreSet.has(blockType) && this.pickaxeSet.has(tool.id);
  }

  launchSpread(dimension, blockLocation, tool) {
    spreadMine(dimension, blockLocation, this.oreSet, this.drop, tool);
  }
}


const level1PickaxeSet = new Set([
  MinecraftItemTypes.netheritePickaxe.id,
  MinecraftItemTypes.diamondPickaxe.id,
  MinecraftItemTypes.ironPickaxe.id,
  MinecraftItemTypes.stonePickaxe.id,
  MinecraftItemTypes.woodenPickaxe.id,
  MinecraftItemTypes.goldenPickaxe.id
]);
const level2PickaxeSet = new Set([
  MinecraftItemTypes.netheritePickaxe.id,
  MinecraftItemTypes.diamondPickaxe.id,
  MinecraftItemTypes.ironPickaxe.id,
  MinecraftItemTypes.stonePickaxe.id
]);
const level3PickaxeSet = new Set([
  MinecraftItemTypes.netheritePickaxe.id,
  MinecraftItemTypes.diamondPickaxe.id,
  MinecraftItemTypes.ironPickaxe.id
]);
const level4PickaxeSet = new Set([
  MinecraftItemTypes.netheritePickaxe.id,
  MinecraftItemTypes.diamondPickaxe.id
]);


const coalOreSet = new Set([
  MinecraftBlockTypes.coalOre,
  MinecraftBlockTypes.deepslateCoalOre
]);
const lapisOreSet = new Set([
  MinecraftBlockTypes.lapisOre,
  MinecraftBlockTypes.deepslateLapisOre
]);
const copperOreSet = new Set([
  MinecraftBlockTypes.copperOre,
  MinecraftBlockTypes.deepslateCopperOre
]);
const ironOreSet = new Set([
  MinecraftBlockTypes.ironOre,
  MinecraftBlockTypes.deepslateIronOre
]);
const goldOreSet = new Set([
  MinecraftBlockTypes.goldOre,
  MinecraftBlockTypes.deepslateGoldOre
]);
const redstoneOreSet = new Set([
  MinecraftBlockTypes.redstoneOre,
  MinecraftBlockTypes.litRedstoneOre,
  MinecraftBlockTypes.deepslateRedstoneOre,
  MinecraftBlockTypes.litDeepslateRedstoneOre
]);
const diamondOreSet = new Set([
  MinecraftBlockTypes.diamondOre,
  MinecraftBlockTypes.deepslateDiamondOre
]);
const emeraldOreSet = new Set([
  MinecraftBlockTypes.emeraldOre,
  MinecraftBlockTypes.deepslateEmeraldOre
]);
const quartzOreSet = new Set([
  MinecraftBlockTypes.quartzOre
]);
const netherGoldOreSet = new Set([
  MinecraftBlockTypes.netherGoldOre
]);


const coalData = new OreData(coalOreSet, level1PickaxeSet, dropCoal);
const lapisData = new OreData(lapisOreSet, level2PickaxeSet, dropLapis);
const copperData = new OreData(copperOreSet, level2PickaxeSet, dropCopper);
const ironData = new OreData(ironOreSet, level2PickaxeSet, dropIron);
const goldData = new OreData(goldOreSet, level3PickaxeSet, dropGold);
const redstoneData = new OreData(redstoneOreSet, level3PickaxeSet, dropRedstone);
const diamondData = new OreData(diamondOreSet, level3PickaxeSet, dropDiamond);
const emeraldData = new OreData(emeraldOreSet, level3PickaxeSet, dropEmerald);
const quartzData = new OreData(quartzOreSet, level1PickaxeSet, dropQuartz);
const netherGoldData = new OreData(netherGoldOreSet, level1PickaxeSet, dropNetherGold);


const oreDataList = [
  coalData,
  lapisData,
  copperData,
  ironData,
  goldData,
  redstoneData,
  diamondData,
  emeraldData,
  quartzData,
  netherGoldData
];


const mineAll = world.events.blockBreak.subscribe(eventData => {
  if (!getIsActive(eventData.player))
    return;
  let tool = getEquippedItem(eventData.player);
  if (tool === undefined)
    return;
  let blockLocation = eventData.block.location;
  let blockType = eventData.brokenBlockPermutation.type;

  oreDataList.forEach(oreData => {
    if (oreData.testCase(blockType, tool)) {
      oreData.launchSpread(eventData.dimension, blockLocation, tool);
    }
  });

  /* tests */
  // let components = tool.getComponents()
  // let names = components.map(component => component.id)
  // eventData.dimension.runCommand("say _" + names);

});
