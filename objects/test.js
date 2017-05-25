var Enemy = require("./enemy");
var Player = require("./player");
var Game = require("./game");
var player = new Player("leon");
var enemy = new Enemy("akram", 5);
console.log("battle has begon");
console.log(enemy.name + " has " + enemy.totalHp + " HP");
// used to get user input
function prompt(question, callback) {
    var stdin = process.stdin,
        stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once('data', function (data) {
      callback(data.toString().trim());
    });
}
//game state
var done = false;
battle();
function battle() {
  var actions = player.getActions("left");

  for (var i = 0; i < actions.length; i++) {
    var weaponName = player.equipedWeapons.left.name;
    var actionName = actions[i].name;
    var usesLeft = actions[i].usage - actions[i].used;
    var dmg = actions[i].dmg_multiplier * player.equipedWeapons.left.dmg;
    console.log(i+". "+weaponName ,actionName + " does " + dmg + " damage and has " + usesLeft + " uses left");
  }

  prompt("wich one would you like to do?\n", (input) => {
    var hp = player.attack(enemy, "left", input);
    if (hp == 0) {
      done = true;
    }
    console.log(enemy.name + " has " + hp + " HP");
    if (!done) {
      battle();
    } else {
      console.log("you have won the battle!");
      process.exit();
    }
  });
}
