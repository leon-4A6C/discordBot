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
    left: new Hands(5),
    right: new Hands(10)
  };
  this.items = [];
  this.maxHp = 10;
  this.hp = 10;
  this.totalHp = 10;
}

Player.prototype = {
  // weapon left(0) or right(1)
  attack: function(weapon, opponent) {
    if (weapon === 0) {
      weapon = "left";
    } else {
      weapon = "right";
    }
    // TODO: attack an opponent
    opponent.hp -= this.equipedWeapons[weapon].dmg;
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
    this.equipedArmor[slot] = weapon;
  }
};

module.exports = Player;
