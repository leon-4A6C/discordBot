// script with all the different weapons.

var Item = require("./Item");

function Weapon(dmg) {
  this.prototype = Object.create(Item.prototype);
  this.dmg = dmg;
}


module.exports = Weapon;
