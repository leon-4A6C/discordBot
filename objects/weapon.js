var Item = require("./item");
// script with all the different weapons.

function Weapon(targetLvl) {
  this.name = "unnamed";
  this.itemId;
  this.maxLvl = 5;
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.dmg = Math.ceil((Math.random()*5+5)*this.lvl*5)*0.25;
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

function Hand(targetLvl) {
  this.itemId = 0;
  this.name = "hand";
  this.maxLvl = 5;
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  if (this.lvl > this.maxLvl) {
    this.lvl = this.maxLvl;
  }
  this.dmg = Math.ceil((Math.random()*5+5)*this.lvl*5*0.25);
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
