var Enemy = require("./enemy");
var Player = require("./player");
var Game = require("./game");
var player = new Player("leon");
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
// game state
var ongoingBattle = false;
var enemy;
function battle() {
  //game state
  if (!ongoingBattle) {
    enemy = new Enemy(null, player.lvl);
  }
  ongoingBattle = true;
  var done = false;
  console.log("battle has begon");
  console.log(enemy.name + " has " + enemy.totalHp + " HP");
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
      enemy.doMove(player);
      console.log("your new hp is " + player.hp);
      if (player.hp <= 0) {
        done = true;
        console.log("enemy won the battle!");
        var info = player.addXp(5); // you always get 5xp
        if (info.lvl) {
          console.log("you lvled up you are now lvl. " + info.lvl + " and have " + info.xp + " xp!");
        }
        player.resetWeaponActions();
        ongoingBattle = false;
        game();
      } else {
        battle();
      }
    } else {
      console.log("you have won the battle!");
      var info = player.addXp(enemy);
      if (info.lvl) {
        console.log("you lvled up you are now lvl. " + info.lvl + " and have " + info.xp + " xp!");
      }
      player.resetWeaponActions();
      ongoingBattle = false;
      game();
    }
  });
}
game();
function game() {
  prompt("what would you like to do?\nhelp for the help page.(help)\n", (input) => {
    if (!input) {
      input = "help";
    }
    if (input === "battle") {
      battle();
    }
    if (input === "help") {
      console.log("battle to battle\nitems get your items\nhelp for help");
    }
    if (input === "items") {
      if (player.items.length === 0) {
        console.log("you have got no items! get some by battling");
      } else {
        var itemText = "";
        for (var i = 0; i < player.items.length; i++) {
          itemText += i+". "+player.items[i];
          if (i % 3 == 0) {
            console.log(itemText);
          }
        }
        prompt("select an item\n", (input) => {
          var selectedItem = input;
          prompt("what would you like to do with the item?\nuse, drop (use)\n", (input) => {
            if (!input || input === "use") {
              if (player.items[selectedItem].type === "food") {
                prompt("use item? y/n\n", (input) => {
                  if (input === "y") {
                    player.eat(player.items[selectedItem]);
                    player.items.splice(input, 1);
                    console.log("you ate the item");
                  } else {
                    console.log("ok did nothing");
                  }
                });
              }
              if (player.items[selectedItem].type === "weapon") {
                prompt("where would you like to equip the item? left or right (left)\n", (input) => {
                  if (!input) {
                    input = "left";
                  }
                  player.equipWeapon(player.items[selectedItem], input);
                });
              }
              if (player.items[selectedItem].type === "harness") {
                player.equipArmor(player.items[selectedItem], "harness");
              }
              if (player.items[selectedItem].type === "boots") {
                player.equipArmor(player.items[selectedItem], "boots");
              }
              if (player.items[selectedItem].type === "pants") {
                player.equipArmor(player.items[selectedItem], "pants");
              }
              if (player.items[selectedItem].type === "gloves") {
                player.equipArmor(player.items[selectedItem], "gloves");
              }
              if (player.items[selectedItem].type === "helmet") {
                player.equipArmor(player.items[selectedItem], "helmet");
              }
            }
            if (input === "drop") {
              player.dropItem(player.items[selectedItem]);
              console.log("dropped the item");
            }
          });
        });
      }
    }
    // if not done battling
    if (!battle) {
      game();
    }
  });
}
