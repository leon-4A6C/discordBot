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
    for (var i = 0; i < this.equipedWeapons.length; i++) {
      this.equipedWeapons[i]
    }
  },
  eat: function(food) {
    // TODO: eat food
  },
  equipArmor: function(armor) {
    // TODO: equip armor, boots, pants, harness, helmet, gloves
  },
  equipWeapon: function(weapon) {
    // TODO: equip a weapon
  }
};

module.exports = Player;
