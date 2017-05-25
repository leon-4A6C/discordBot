var Game = require("./game"); // used to generate armor and weapons
// basic enemy
// give it a lvl you want it to have
function Enemy(name, targetLvl) {
  // make it a bit more random
  var targetLvlWiggleRoom = Math.floor(Math.random()*targetLvl-targetLvl/2);
  this.lvl = targetLvl + targetLvlWiggleRoom;
  if (this.lvl <= 0) {
    this.lvl = 1;
  }
  this.name = name || "unnamed";
  this.equipedArmor = {
    boots: null,
    pants: null,
    harness: null,
    helmet: null,
    gloves: null
  };
  this.equipedWeapons = {
    left: null,
    right: null
  };
  // the items it is going to drop if the user wins
  this.dropItems = [];
  // max hp for the enemy it self, hp when full
  this.maxHp = 10;
  // current hp from the enemy it self
  this.hp = this.maxHp;
  // totalHp of the enemy including armor and buffs... when I add buffs
  this.totalHp = this.hp;
  for (var armorPiece in this.equipedArmor) {
    // check if there is armor in the slot
    if (this.equipedArmor.hasOwnProperty(armorPiece) && this.equipedArmor[armorPiece]) {
      this.totalHp += this.equipedArmor[armorPiece].hp;
    }
  }
}
// for testing porposes
for (var i = 0; i < 10; i++) {
  console.log(new Enemy(null, 5));
  // add new line to see it better
  console.log();
}
