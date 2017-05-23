// script with all the different types of food.

var Item = require("./Item");

function Food(hp) {
  this.prototype = Object.create(Item.prototype);
  this.hp = hp;
}


module.exports = food;
