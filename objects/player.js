// player
function Player(name, xp, lvl) {
  this.name = name || "unnamed";
  this.xp = xp || 0;
  this.lvl = lvl || 0;
  this.equipedArmor = [];
  this.equipedWeapons = [];
  this.items = [];
}

Player.prototype = {
  attack: function(weapon) {
    // TODO: attack an opponent
  },
  eat: function(food) {
    // TODO: eat food
  },
  equipItem: function() {
    // TODO: equip an item
  }
};
