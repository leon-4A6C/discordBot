var Item = require("./item");
// script with all the armor pieces

function Armor(targetLvl) {
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  this.hp = 10;
  this.itemId;
  this.type = "boots"; // boots, harness, helmet, gloves or pants
}
// inherit from item
Armor.prototype = Object.create(Item.prototype);

// removes hp from armor
Armor.prototype.dmg = function(dmg) {
  this.hp -= dmg;
  if (this.hp < 0) {
    // TODO: remove armor from existence
  }
}

module.exports = Armor;
