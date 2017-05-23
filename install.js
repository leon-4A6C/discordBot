// discordBot install script
var fs = require("fs");
var child = require("child_process");
var data = require("./tokens_default");

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

if (!fs.existsSync("node_modules")) {
  const spawn = child.spawn;
  const ls = spawn('npm', ['install']);

  ls.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  ls.stderr.on('data', (data) => {
    console.log(`${data}`);
  });

  ls.on('close', (code) => {
    console.log(`${code}`);
    createToken();
  });
} else {
  createToken();
}

function createToken() {
  if (fs.existsSync("tokens.json")) {
    fs.unlink("tokens.json", (err) => {
      if (err) {
        console.error("couldn't delete tokens.json");
      }
    });
  }

  prompt("paste your discord token\n", (input) => {
    data.discord = input;
    prompt("paste your cleverbot token\n", (input) => {
      data.cleverbot = input;
      prompt("the defaults are\nDBhost: "+data.DBhost+"\nDBusername: "+data.DBusername+"\nDBpassword: "+data.DBpassword+"\ndo you want to change your DB login? y/n ", (input) => {
        if (input.toLowerCase() == "n") {
          writeTokens();
        } else if (input.toLowerCase() == "y") {
          prompt("DB host (localhost)\n", (input) => {
            if (input) {
              data.DBhost = input;
            }
            prompt("DB username (discord)\n", (input) => {
              if (input) {
                data.DBusername = input;
              }
              prompt("DB password (discord)\n", (input) => {
                if (input) {
                  data.DBpassword = input;
                }
                writeTokens();
              });
            });
          });
        } else {
          console.log("you didn't press the correct key.");
          createToken();
          return
        }
      })
    });
  });
  function writeTokens() {
    fs.writeFile('tokens.json', JSON.stringify(data), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      console.log("you can now start the bot by typing\nnode index.js");
      throw "done!";
    });
  }
}
