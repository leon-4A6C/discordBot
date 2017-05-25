// a javascript file to test the game components
var Food = require("./food");
var Armor = require("./armor");
var Weapon = require("./weapon");
var Player = require("./player");
var Enemy = require("./enemy");
// var player1 = new Player("leon");
// var player2 = new Player("akram");
// console.log(player2.name + " health", player1.attack(player2, "left", 2));
// console.log(player1.name + " health", player2.attack(player1, "left", 1));
// console.log(player2.name + " health", player1.attack(player2, "left", 0));

// index of all the items, used for enemy creation and enemy drops
var items =
{
  // all the armor pieces
  armor: {
    boots: [
      // put armor classes here
    ],
    pants: [

    ],
    harness: [
      {
        item: Armor.Shirt,
        dropChance: 0.05
      }
    ],
    helmet: [

    ],
    gloves: [

    ]
  },
  // all the weapons
  weapons: {
    left: [
      {
        item: Weapon.Hand,
        dropChance: 0
      }
    ],
    right: [
      {
        item: Weapon.Hand,
        dropChance: 0
      }
    ]
  },
  // all the different foods
  food: [
    {
      item: Food.Donut,
      dropChance: 0.1
    }
  ]
};

var enemies = [

];

// export so that the main file can require it all at once
module.exports = {
  // Food: Food,
  // Armor: Armor,
  // Weapon: Weapon,
  Player: Player,
  items: items,
  enemies: enemies
};
