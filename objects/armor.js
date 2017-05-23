// script with all the armor pieces

var Item = require("./item");

function Armor(hp, type) {
  this.prototype = Object.create(Item.prototype);
  this.hp = hp;
  this.type = type || "something";
}

Armor.prototype = {
  // removes hp from armor
  dmg: function(dmg) {
    this.hp -= dmg;
    if (this.hp < 0) {
      // TODO: remove armor from existence
    }
  }
};

module.exports = Armor;
