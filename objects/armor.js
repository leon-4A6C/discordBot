// script with all the armor pieces

var Item = require("./item");

function Armor(hp, type) {
  this.hp = hp;
  this.type = type || "something";
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
