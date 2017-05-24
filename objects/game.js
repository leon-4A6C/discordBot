// a javascript file to test the game components
var Food = require("./food");
var Armor = require("./armor");
var Weapon = require("./weapon");
var Player = require("./player");
var player1 = new Player("leon");
var player2 = new Player("akram");
console.log(player2.name + " health", player1.attack(player2, "left", 2));
console.log(player1.name + " health", player2.attack(player1, "left", 1));
console.log(player2.name + " health", player1.attack(player2, "left", 0));

// export so that the main file can require it all at once
module.exports = {
  Food: Food,
  Armor: Armor,
  Weapon: Weapon
  Player: Player
};
