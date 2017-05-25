var Game = require("./game"); // used to generate armor and weapons
var Player = require("./player");
// basic enemy
// give it a lvl you want it to have
function Enemy(name, targetLvl) {
  // make it a bit more random
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  this.name = name || "unnamed";
  this.equipedArmor = {
    boots: this.getRandomArmor("boots"),
    pants: this.getRandomArmor("pants"),
    harness: this.getRandomArmor("harness"),
    helmet: this.getRandomArmor("helmet"),
    gloves: this.getRandomArmor("gloves")
  };
  this.equipedWeapons = {
    left: this.getRandomWeapon("left"),
    right: this.getRandomWeapon("right")
  };
  this.maxDropItems = 5;
  // the items it is going to drop if the user wins
  this.dropItems = this.getDropItems();
  // hp multiplier for easier enemy creation with more hp, make it harder, for something like bosses
  this.hpMultiplier = 5;
  // max hp for the enemy it self, hp when full
  this.maxHp = Math.ceil((Math.random()*this.hpMultiplier+this.hpMultiplier)*this.lvl*this.hpMultiplier);
  // current hp from the enemy it self
  this.hp = this.maxHp;
  // totalHp of the enemy including armor and buffs... when I add buffs
  this.totalHp = this.hp;
  for (var armorPiece in this.equipedArmor) {
    // check if there is armor in the slot
    if (this.equipedArmor.hasOwnProperty(armorPiece) && this.equipedArmor[armorPiece]) {
      this.totalHp += this.equipedArmor[armorPiece].hp;
    }
  }
}
Enemy.prototype = Object.create(Player.prototype);

// gets a random weapon, left(0) or right(1) in type
Enemy.prototype.getRandomWeapon = function(type) {
  if (type === 0) {
    type = "left";
  } else if (type === 1) {
    type = "right";
  }
  if (Game.items.weapons[type].length === 0) {
    return null
  }
  var weapon = new Game.items.weapons[type][Math.floor(Math.random()*Game.items.weapons[type].length)].item(this.lvl);
  if (Math.random() >= 0.5) {
    return weapon
  } else {
    return null
  }
}
// get a random piece of armor, same as getRandomWeapon but for armor, left(0) or right(1) in type
Enemy.prototype.getRandomArmor = function(type) {
  switch (type) {
    case 0:
      type = "boots";
      break;
    case 1:
      type = "pants";
      break;
    case 2:
      type = "harness";
      break;
    case 3:
      type = "helmet";
      break;
    case 4:
      type = "gloves";
      break;
  }
  if (Game.items.armor[type].length === 0) {
    return null
  }
  var armor = new Game.items.armor[type][Math.floor(Math.random()*Game.items.armor[type].length)].item(this.lvl);
  if (Math.random() >= 0.5) {
    return armor
  } else {
    return null
  }
}

Enemy.prototype.getDropItems = function() {
  var dropItems = [];
  for (var item in Game.items) {
    if (Game.items.hasOwnProperty(item)) {
      if (item === "food") {
        if (Game.items[item].length > 0) {
          var selectedItem = Game.items[item][Math.floor(Math.random()*Game.items[item].length)];
        }
      } else {
        for (var item1 in Game.items[item]) {
          if (Game.items[item].hasOwnProperty(item1)) {
            if (Game.items[item][item1].length > 0) {
              var selectedItem = Game.items[item][item1][Math.floor(Math.random()*Game.items[item][item1].length)];
            }
          }
        }
      }
      // console.log(selectedItem);
      if (selectedItem.dropChance > Math.random() && dropItems.length < this.maxDropItems) {
        dropItems.push(new selectedItem.item(this.lvl));
        // possibility for double drops
        if (selectedItem.dropChance > Math.random() && dropItems.length < this.maxDropItems) {
          dropItems.push(new selectedItem.item(this.lvl));
        }
      }
    }
  }
  return dropItems;
}

// // for testing porposes
// for (var i = 0; i < 10; i++) {
//   console.log(new Enemy(null, 5));
//   // new Enemy(null, 5);
//   // add new line to see it better
//   console.log();
// }

module.exports = Enemy;
