var Weapon = require("./weapon");
// player
function Player(name, xp, lvl) {
  this.name = name || "unnamed";
  this.xp = xp || 0;
  this.lvl = lvl || 0;
  this.equipedArmor = {
    boots: null,
    pants: null,
    harness: null,
    helmet: null,
    gloves: null
  };
  this.equipedWeapons = {
    left: new Weapon.Hand(5),
    right: new Weapon.Hand(10)
  };
  this.items = [];
  // max hp for the player it self
  this.maxHp = 10;
  // hp from the player it self
  this.hp = 10;
  // totalHp of the player including armor and buffs
  this.totalHp = 10;
}

Player.prototype = {
  // weapon left(0) or right(1)
  // attack returns the opponent's new health
  attack: function(opponent, weapon, action) {
    if (weapon === 0) {
      weapon = "left";
    } else if(weapon === 1) {
      weapon = "right";
    }
    var newOpponentHp = opponent.dmg(this.equipedWeapons[weapon].attackDmg(action));
    return newOpponentHp
  },
  eat: function(food) {
    // TODO: eat food
    // TODO: select food in function somewhere else
    this.hp += food.hp;
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
  },
  dropItem: function(item) {
    // drop the item
    this.items.splice(this.items.indexOf(item), 1);
  },
  // equips armor in a slot(boots(0), pants(1), harness(2), helmet(3) or gloves(4))
  equipArmor: function(armor, slot) {
    switch (slot) {
      case 0:
        slot = "boots";
        break;
      case 1:
        slot = "pants";
        break;
      case 2:
        slot = "harness";
        break;
      case 3:
        slot = "helmet";
        break;
      case 4:
        slot = "gloves";
        break;
    }
    // equip armor, boots, pants, harness, helmet or gloves
    this.equipedArmor[slot] = armor;
  },
  // equips weapon in a slot(left(0) or right(1))
  equipWeapon: function(weapon, slot) {
    if (slot === 0) {
      slot = "left";
    } else if (slot === 1) {
      slot = "right";
    }
    // equip weapon
    this.equipedWeapons[slot] = weapon;
  },
  // take damage, returns new hp from this player
  dmg: function(dmg) {
    this.hp -= dmg;
    if (this.hp < 0) {
      this.hp = 0;
    }
    return this.hp
  }
};

module.exports = Player;
