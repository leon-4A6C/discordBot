// script with all the armor pieces

var Item = require("./item");

function Armor(hp) {
  this.prototype = Object.create(Item.prototype);
  this.hp = hp;
}

module.exports = Armor;
