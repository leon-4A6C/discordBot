// script with all the different types of food.
var Item = require("./item");

function Food(hp) {
  this.hp = hp;
}
// inherit from item
Food.prototype = Object.create(Item.prototype);

module.exports = Food;
