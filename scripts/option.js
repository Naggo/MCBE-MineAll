import { world, DynamicPropertiesDefinition, MinecraftEntityTypes } from "mojang-minecraft";


const isActiveKey = "mineall:isActive";
const maxChainsKey = "mineall:maxChains";


export function getIsActive(player) {
    return player.getDynamicProperty(isActiveKey);
}

export function setIsActive(player, value) {
    player.setDynamicProperty(isActiveKey, value);
}


export function getMaxChains() {
    return world.getDynamicProperty(maxChainsKey);
}

export function setMaxChains(value) {
    world.setDynamicProperty(maxChainsKey, value);
}


const registerOption = world.events.worldInitialize.subscribe(eventData => {
    // register
    let isActiveProperty = new DynamicPropertiesDefinition();
    isActiveProperty.defineBoolean(isActiveKey);
    
    let maxChainsProperty = new DynamicPropertiesDefinition();
    maxChainsProperty.defineNumber(maxChainsKey);
    
    let propertyRegistry = eventData.propertyRegistry;
    propertyRegistry.registerEntityTypeDynamicProperties(isActiveProperty, MinecraftEntityTypes.player);
    propertyRegistry.registerWorldDynamicProperties(maxChainsProperty);
    
    // initialize
    let playerIterator = world.getPlayers();
    for (let player of playerIterator) {
        if (getIsActive(player) === undefined) {
            setIsActive(player, false);
        }
    }
    
    if (getMaxChains() === undefined) {
        setMaxChains(10);
    }
});


function privateLog(eventData, message) {
  eventData.message = message;
  eventData.targets = [eventData.sender];
  // eventData.cancel = true;
  // eventData.sender.runCommand("w @s " + message)
  // eventData.sendToTargets = true;
  // eventData.targets.push(eventData.sender);
}


const optionManager = world.events.beforeChat.subscribe(eventData => {
    if (! eventData.message.startsWith("#mineall"))
        return;
    let optionArray = eventData.message.trim().split(" ");
    let sender = eventData.sender;
    
    // #mineall
    if (optionArray.length === 1) {
        let isActive = getIsActive(sender);
        let maxChains = getMaxChains()
        privateLog(eventData, `§b[MineAll]§r:
 Your State: ${isActive ? "§aON" : "§cOFF"}§r
 Max Chains: §e${maxChains}§r`);
        return;
    }
    
    switch (optionArray[1]) {
        // #mineall on
        case "on":
            setIsActive(sender, true);
            eventData.message = "§b[Mineall]§a ON§r";
            break;
        
        // #mineall off
        case "off":
            setIsActive(sender, false);
            eventData.message = "§b[MineAll]§c OFF§r";
            break;
        
        // #mineall max
        case "max":
            let number = parseInt(optionArray[2]);
            if (isNaN(number)) {
                privateLog(eventData, "§b[MineAll]§c Number is required")
                break;
            }
            setMaxChains(number);
            eventData.message = `§b[MineAll]§r Set max chains: §e${number}§r`;
            break;
        
        // #mineall list
        case "list":
            let playerIterator = world.getPlayers();
            let stateTable = "";
            for (let player of playerIterator) {
                let isActive = getIsActive(player);
                stateTable += `\n ${player.name.padEnd(8)}: ${isActive ? "§aON" : "§cOFF"}§r`;
            }
            privateLog(eventData, "§b[MineAll]§r List:" + stateTable);
            // eventData.message = "§b[MineAll]§e List:§r" + stateTable;
            break;        
        
        // #mineall (? | help)
        case "?":
        case "help":
            privateLog(eventData, `§b[MineAll]§r Help:
#mineall §7- §oShow current states.§r
#mineall list §7- §oShow the state of all players.§r
#mineall on §7- §oStart MineAll.§r
#mineall off §7- §oStop MineAll.§r
#mineall max <maxChains: number> §7§o- Set max chains.§r
#mineall help §7- §oShow this message.§r`);
            break;
    
        default:
            privateLog(eventData, `§b[MineAll]§c Unknown option: '${optionArray[1]}'`);
    }
});
