// script with all the different weapons.

var Item = require("./item");

function Weapon(dmg) {
  this.dmg = dmg;
  this.actions = [
    {
      // name of the action/attack
      name: "example",
      // multiplies this number with the dmg of the object in the attack
      dmg_multiplier: 1,
      // how many times you can use this in battle
      usage: 2,
      // how many times it has been used in battle
      used: 0
    }
  ];
}
// inherit Item stuff
this.prototype = Object.create(Item.prototype);

Weapon.prototype.attackDmg = function(actionIndex) {
  if (this.actions[actionIndex].used < this.actions[actionIndex].usage) {
    this.actions[actionIndex].used++;
    return this.actions[actionIndex].dmg_multiplier * this.dmg
  } else {
    return 0 // it can't be used any more in this battle
  }
}
Weapon.prototype.resetActions = function() {
  for (var i = 0; i < this.actions.length; i++) {
    this.actions[i].used = 0;
  }
}

function Hand(dmg) {
  this.name = "hand";
  this.dmg = dmg || 5;
  this.actions = [
    {
      name: "punch",
      dmg_multiplier: 1,
      usage: 5,
      used: 0
    },
    {
      name: "hook",
      dmg_multiplier: 1.1,
      usage: 3,
      used: 0
    },
    {
      name: "upper cut",
      dmg_multiplier: 1.5,
      usage: 1,
      used: 0
    }
  ];
}
// inherit Weapon stuff
Hand.prototype = Object.create(Weapon.prototype);

// export
module.exports = {
  Weapon: Weapon,
  Hand: Hand
};
