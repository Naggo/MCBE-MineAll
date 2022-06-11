import { world, Items, ItemStack, MinecraftBlockTypes, MinecraftEnchantmentTypes, MinecraftItemTypes } from "mojang-minecraft";
import { getIsActive, getMaxChains } from "./option";


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


const mineAll = world.events.blockBreak.subscribe(eventData => {
  if (! getIsActive(eventData.player))
    return;
  let tool = eventData.player.getComponent("inventory").container.getItem(eventData.player.selectedSlot);
  if (tool === undefined)
    return;
  let blockLocation = eventData.block.location;
  let blockType = eventData.brokenBlockPermutation.type;

  switch (blockType) {
    case MinecraftBlockTypes.coalOre:
    case MinecraftBlockTypes.deepslateCoalOre:
      if (level1PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, coalOreSet, dropCoal, tool);
      }
      break;
    
    case MinecraftBlockTypes.lapisOre:
    case MinecraftBlockTypes.deepslateLapisOre:
      if (level2PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, lapisOreSet, dropLapis, tool);
      }
      break;
    
    case MinecraftBlockTypes.copperOre:
    case MinecraftBlockTypes.deepslateCopperOre:
      if (level2PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, copperOreSet, dropCopper, tool);
      }
      break;
    
    case MinecraftBlockTypes.ironOre:
    case MinecraftBlockTypes.deepslateIronOre:
      if (level2PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, ironOreSet, dropIron, tool);
      }
      break;
    
    case MinecraftBlockTypes.goldOre:
    case MinecraftBlockTypes.deepslateGoldOre:
      if (level3PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, goldOreSet, dropGold, tool);
      }
      break;
    
    case MinecraftBlockTypes.redstoneOre:
    case MinecraftBlockTypes.litRedstoneOre:
    case MinecraftBlockTypes.deepslateRedstoneOre:
    case MinecraftBlockTypes.litDeepslateRedstoneOre:
      if (level3PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, redstoneOreSet, dropRedstone, tool);
      }
      break;
    
    case MinecraftBlockTypes.diamondOre:
    case MinecraftBlockTypes.deepslateDiamondOre:
      if (level3PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, diamondOreSet, dropDiamond, tool);
      }
      break;
    
    case MinecraftBlockTypes.emeraldOre:
    case MinecraftBlockTypes.deepslateEmeraldOre:
      if (level3PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, emeraldOreSet, dropEmerald, tool);
      }
      break;
    
    case MinecraftBlockTypes.quartzOre:
      if (level1PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, quartzOreSet, dropQuartz, tool);
      }
      break;
    
    case MinecraftBlockTypes.netherGoldOre:
      if (level1PickaxeSet.has(tool.id)) {
        spreadMine(eventData.dimension, blockLocation, netherGoldOreSet, dropNetherGold, tool);
      }
      break;
  }
  

  /* tests */
  // let components = tool.getComponents()
  // let names = components.map(component => component.id)
  // eventData.dimension.runCommand("say _" + names);

});
