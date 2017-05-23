// script with all the different weapons.

var Item = require("./Item");

function Weapon(dmg) {
  // inherit Item stuff
  this.prototype = Object.create(Item.prototype);
  this.dmg = dmg;
  this.actions = [];
}

function Hands(dmg) {
  // inherit Weapon stuff
  this.prototype = Object.create(Weapon.prototype);
  this.dmg = dmg || 5;
  this.actions = ["punch", "left hook", "right hook", "upper cut"];
}

module.exports = Weapon;
