// script with all the different types of food.
var Item = require("./item");

function Food(hp) {
  this.itemId;
  this.hp = hp || 10;
}
// inherit from item
Food.prototype = Object.create(Item.prototype);
function Donut(hp) {
  this.itemId = 1;
  this.hp = hp;
}
// inherit from Food
Donut.prototype = Object.create(Food.prototype);

module.exports = {
  Donut: Donut
};
