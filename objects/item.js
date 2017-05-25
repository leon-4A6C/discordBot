// var Game = require("./game");

// main game component.
function Item() {
  this.itemId;
  this.name;
  this.description = ""; // give an item an description so that the user can read it
}
// if you want to make the item do this: var item = new Item.newItem(0)(item contructor stuff);
// Item.prototype.newItem = function (itemId) {
//   for (var gameComponent in Game) {
//     if (Game.hasOwnProperty(gameComponent)) {
//       for (var item in Game[gameComponent]) {
//         if (Game[gameComponent].hasOwnProperty(item)) {
//           var tmpItem = new Game[gameComponent][item]();
//           if (tmpItem.itemId === itemId) {
//             return Game[gameComponent][item];
//           }
//         }
//       }
//     }
//   }
// };

module.exports = Item;
