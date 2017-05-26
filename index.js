const Discord = require("discord.js");
const bot = new Discord.Client();
const http = require('http');
const Cleverbot = require("./objects/cleverbot.js");
const fs = require("fs-extra");
const youtubedl = require("youtube-dl");
const ffmpeg = require("fluent-ffmpeg");
const helpFile = require('./help');
var tokens = require('./tokens');
if (!tokens) {
  console.error("use, node install.js, to install");
}
const mysql = require('mysql');
var mysqlConn = mysql.createConnection({
  host: tokens.DBhost || "localhost",
  user: tokens.DBusername || "discord",
  password: tokens.DBpassword || "discord",
  database: tokens.DBname || "DiscordBot"
});
var running = false;
mysqlConn.connect();

mysqlConn.on('error', (err) => {
  console.log(err);
  mysqlConn.connect();
});

var discordToken = tokens.discord || "TOKEN HERE";
var cleverbotToken = tokens.cleverbot || "TOKEN HERE";

bot.on('ready', () => {
  running = true;
  console.log("logged in as " + bot.user.username + "!");
  updateDB();
  bot.user.setGame("help for help");
});

bot.on("disconnect", (event) => {
  running = false;
  // try to reconnect every second when it gets disconnected
  var interval = setInterval(() => {
    if (running == true) {
      clearInterval(interval);
    } else {
      bot.login(discordToken);
    }
  }, 1000);
});

// guild events
bot.on("guildCreate", guild => {
  updateDB();
});

bot.on("guildDelete", guild => {
  guildDelete(guild);
});

bot.on("guildUpdate", guild => {
  updateDB();
});

// guild member events
bot.on("guildMemberAdd", member => {
  // add user to db
  updateDB();
});

// role events
bot.on("roleCreate", role => {
  updateRoles(role.guild);
});

bot.on("roleDelete", role => {
  deleteRole(role);
});

bot.on("roleUpdate", role => {
  updateDB();
});

// message event
bot.on("message", msg => {
  if (!msg.author.bot) { // if this is not here it would respond to itself and other bots, bots would get xp and stuff
    // update xp and lvl of the user who talked
    mysqlConn.query("SELECT * FROM user WHERE id = "+ msg.author.id, (error, result, fields) => {
      mysqlConn.query("SELECT lvl_multiplier FROM server WHERE id = \""+msg.guild.id+"\"", (error, resultGuild, fields) => {
        var lvlMultiplier = resultGuild[0].lvl_multiplier;
        var xp = (countWords(msg.content)-countDoubles(msg.content));
        // clamp it between 0 and 50
        if (xp < 0) {
          xp = 0;
        } else if (xp > 50) {
          xp = 50
        }
        var newXp = result[0].xp + xp;
        var nextLvlThreshold = Math.floor((Math.pow((result[0].lvl * (lvlMultiplier * 2)), 2)  + 100) * (lvlMultiplier * 2));
        var newLvl = result[0].lvl;
        if (newXp >= nextLvlThreshold) {
          newLvl++;
          newXp -= nextLvlThreshold;
          updateRoles(msg.guild);
          msg.reply("you reached lvl **"+newLvl+"** congrats");
        }
        mysqlConn.query("UPDATE user SET xp = "+ newXp +", lvl = "+ newLvl +" WHERE id = "+msg.author.id, (error, result, fields)=>{
          // console.log(error, result, fields);
        });
      });
    });
    if (msg.content === "invite") {
      bot.generateInvite()
        .then(link => {
          msg.channel.send("invite link: "+link);
        });
    }
    if (getWord(msg.content) === "set") {
      if (msg.member.hasPermission("ADMINISTRATOR")) {
        if (getWord(msg.content, 1) === "min_lvl") {
          var role = getWord(msg.content, 2);
          var lvl = getWord(msg.content, 3);
          var roles = msg.guild.roles.array();
          for (var i = 0; i < roles.length; i++) {
            if (roles[i].name === role) {
              mysqlConn.query("UPDATE role SET lvl = "+ lvl +" WHERE id = "+roles[i].id, (error, result, fields) => {
                if (error) {
                  msg.reply("something went wrong, you probably didn't write the lvl correctly, try again.");
                } else {
                  updateRoles(msg.guild);
                  msg.reply("min_lvl of "+role+" is set to "+lvl);
                }
              });
              var found = true;
            }
          }
          if (!found) {
            msg.reply("invalid name given");
          }
        } else if (getWord(msg.content, 1) === "lvl_multiplier") {
          newMultiplier = getWord(msg.content, 2);
          mysqlConn.query("UPDATE server SET lvl_multiplier = "+newMultiplier+" WHERE id = \""+msg.guild.id+"\"", (error, result, fields) => {
            if (error) {
              console.log(error);
            }
            msg.reply("lvl_multiplier is set to "+newMultiplier);
          });
        }
      } else {
        msg.reply("you don't have permissions to do that");
      }
    }
    if (getWord(msg.content) === "stats") {
      mysqlConn.query("SELECT xp, lvl FROM user WHERE id = \""+ msg.author.id+"\"", (error, result, fields)=>{
        mysqlConn.query("SELECT lvl_multiplier FROM server WHERE id = \""+msg.guild.id+"\"", (error, resultGuild, fields) => {
          var lvlMultiplier = resultGuild[0].lvl_multiplier;
          var nextLvlThreshold = Math.floor((Math.pow((result[0].lvl * (lvlMultiplier * 2)), 2)  + 100) * (lvlMultiplier * 2));
          msg.reply("these are your stats: \nxp: " + result[0].xp + "\nlvl: " + result[0].lvl + "\nxp needed for next lvl: " + nextLvlThreshold);
        });
      });
    }
    if (getWord(msg.content) === "leaderboard") {
      var reply = "";
      mysqlConn.query("SELECT xp, lvl, username FROM server_has_user INNER JOIN user ON user.id = user_id INNER JOIN server ON server.id = server_id WHERE server.id = \""+msg.guild.id+"\" ORDER BY lvl DESC, xp DESC LIMIT 5", (error, results, fields) => {
        if (error) {
          console.log(error);
        } else {
          reply += "\n**top guild**\n";
          for (var i = 0; i < results.length; i++) {
            reply += (i+1)+". " + results[i].username + " is lvl: " + results[i].lvl + " and has " + results[i].xp + " xp\n";
          }
        }
        mysqlConn.query("SELECT xp, lvl, username FROM user ORDER BY lvl DESC, xp DESC LIMIT 5", (error, results, fields) => {
          if (error) {
            console.log(error);
          } else {
            reply += "\n**top global**\n";
            for (var i = 0; i < results.length; i++) {
              reply += (i+1)+". " + results[i].username + " is lvl: " + results[i].lvl + " and has " + results[i].xp + " xp\n";
            }
          }
          if (reply) {
            msg.reply(reply);
          } else {
            msg.reply("error");
          }
        });
      });
    }
    if (getWord(msg.content) === "deleteHistory") {
      mysqlConn.query("UPDATE user SET botHistory = null WHERE id = \""+msg.author.id+"\"", (error, results, fields) => {
        if (error) {
          console.log(error);
        } else {
          msg.reply("chatbot history has been deleted!");
        }
      });
    }
    if (getWord(msg.content)==="play") {
      var url = getWord(msg.content, 1);
      if (url === getWord(msg.content)) {
        msg.reply("you did not give me a link");
      } else {
        var channels = msg.guild.channels.array();
        var found = false;
        for (var i = 0; i < channels.length; i++) {
          if(channels[i].type === "voice" && channels[i].name === "music") {
            found = true;
            join(channels[i]);
          }
        }
        if (!found) {
          msg.guild.createChannel("music", "voice")
            .then(channel => {
              msg.channel.send(`Created new channel ${channel}`);
              join(channel);
            })
            .catch(console.error);
        }
        function join(channel) {
          channel.join()
          .then(connection => {
            msg.channel.send('Connected!');
            var video = youtubedl(url, ["--format=18"], {cwd:__dirname});
            var filename = "";
            if (!fs.existsSync("./tmp")){
              fs.mkdirSync("./tmp");
            }
            video.on("info", function(info) {
              filename = info._filename;
              filename = filename.substr(filename.length-15, filename.length);
              filename = filename.substr(0, filename.length-4);
              video.pipe(fs.createWriteStream("./tmp/"+filename+".mp4"));
              msg.channel.send("downloading!");
            });
            video.on("end", function() {
              console.log("done downloading!");
              ffmpeg("./tmp/"+filename+".mp4")
                .toFormat("mp3")
                .on("error", function(error) {
                  console.error(error);
                })
                .on("end", function() {
                  console.log("done! converting!");
                  fs.unlink("./tmp/"+filename+".mp4", function() {
                    console.log("done!");
                  });
                  const dispatcher = connection.playFile(__dirname+"/tmp/"+filename+".mp3", {volume:1});
                  msg.channel.send("playing!");
                })
                .save("./tmp/"+filename+".mp3");
            });
          })
          .catch(console.error);
        }
      }
    }
    if (getWord(msg.content)==="stop") {
      // TODO: stop music and delete music
      var channels = msg.guild.channels.array();
      for (var i = 0; i < channels.length; i++) {
        if(channels[i].type === "voice" && channels[i].name === "music") {
          channels[i].leave();
          msg.channel.send('Disconnected!');
        }
      }
    }
    if (contains("ping", msg.content)) {
      msg.channel.send("pong");
    }
    if (contains("marco", msg.content)) {
      msg.channel.send("polo");
    }
    if (msg.content === "help") {
      var message = "";
      message += "__**test bot 2.0 help**__";
      for (var i = 0; i < helpFile.length; i++) {
        message+="\n\n***"+helpFile[i].title+"***\ncommand: `"+helpFile[i].command+"`\n*"+helpFile[i].description+"*";
      }
      msg.author.send(message);
    }
    if (getWord(msg.content) === "spam") {
      var mentions = msg.mentions.users.array();
      var amount = between("-", msg.content);
      var message = between('"', msg.content);
      if (msg.mentions.everyone === true) {
        msg.channel.send("everyone is being spammed!");
        for (var i = 0; i < msg.guild.members.array().length; i++) {
          if (!msg.guild.members.array()[i].user.bot) {
            for (var j = 0; j < amount; j++) {
              msg.guild.members.array()[i].send(message).catch(console.error);
            }
          }
        }
      }
      if (msg.mentions.roles.array()[0]) {
        for (var i = 0; i < msg.mentions.roles.array().length; i++) {
          msg.channel.send("everyone in "+msg.mentions.roles.array()[i].name+" is being spammed!");
          for (var j = 0; j < msg.mentions.roles.array()[i].members.array().length; j++) {
            if (!msg.mentions.roles.array()[i].members.array()[j].user.bot) {
              for (var k = 0; k < amount; k++) {
                msg.mentions.roles.array()[i].members.array()[j].send(message).catch(console.error);
              }
            }
          }
        }
      }
      for (var i = 0; i < mentions.length; i++) {
        msg.channel.send(mentions[i].username +  " is being spammed!");
        for (var j = 0; j < amount; j++) {
          mentions[i].send(message);
        }
      }
    }
    if (msg.mentions.users.array()[0]) {
      try {
        if (msg.mentions.users.array()[0].id === bot.user.id) {
          mysqlConn.query("SELECT botHistory FROM user WHERE id = \""+msg.author.id+"\"", (error, results, fields) => {
            var cs = '';
            if (results[0].botHistory != null || results[0].botHistory != "null") {
              cs = results[0].botHistory;
            }
            // creates new cleverbot and gives it the api key and history if the user has it
            var cleverbot = new Cleverbot({key: cleverbotToken, cs: cs});
            cleverbot.say(between('"', msg.content), (output, error) => {
              if (error) {
                console.log(error);
              }else {
                msg.reply(output);
                // updates history on DB
                mysqlConn.query("UPDATE user SET botHistory = \""+cleverbot.options.cs+"\" WHERE id = \""+msg.author.id+"\"", (error, results, fields) => {
                  if (error) {
                    console.log(error);
                  } else {
                    cleverbot = null;
                  }
                });
              }
            });
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
    if (getWord(msg.content) == "deleteMessages") {
      var name = getWord(msg.content, 1);
      if (name == getWord(msg.content, 0)) {
        name = msg.channel.name;
      }
      var guild = msg.guild;
      guild.createChannel('new-'+name, 'text')
        .then(channel => {
          channel.send(`Created new channel ${channel}`);
          msg.channel.delete()
            .then(console.log("channel deleted")) // success
            .catch(console.error); // log error
          channel.setName(name)
            .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
            .catch(console.error);
        })
        .catch(console.error);
    }
    if (getWord(msg.content) == "abort") {
      var name = getWord(msg.content, 1);
      msg.channel.delete()
        .then(console.log("channel deleted")) // success
        .catch(console.error); // log error
    }
    if (getWord(msg.content) == "create") {
      var name = getWord(msg.content, 1);
      if (name == getWord(msg.content, 0)) {
        msg.reply("give me a name as second parameter!");
      } else {
        msg.guild.createChannel(name, 'text')
          .then(channel => channel.send(`successfuly created ${channel}`))
          .catch(console.error);
      }
    }
    if (msg.content === "test") {
      console.log(msg);
    }
    if (contains("cat", msg.content) || contains("miauw", msg.content) || contains("pussy", msg.content) || contains("poekie", msg.content)) {
      var url = 'http://random.cat/meow';

      http.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
          body += chunk;
        });

        res.on('end', function(){
          var response = JSON.parse(body);
          console.log("Got a response: ", response.file);
          msg.channel.send(response.file);
        });
      }).on('error', function(e){
        console.error("Got an error: ", e);
      });
    }
  } // end of if not bot check
});

bot.login(discordToken);

function updateDB() {
  var guilds = bot.guilds.array();
  // console.log(guilds);
  for (var i = 0; i < guilds.length; i++) {
    (function(guildCount) {
      mysqlConn.query("SELECT id FROM server WHERE id = \""+guilds[guildCount].id+"\"", (error, results, fields) =>{
        if (results.length == 0) {
          mysqlConn.query("INSERT INTO server(id, name) VALUES (\""+guilds[guildCount].id+"\", \""+guilds[guildCount].name+"\")", (error, results, fields) => {
            // console.log(error, results, fields);
          });
        } else {
          updateGuild(guilds[guildCount]);
        }
      });
      var users = guilds[guildCount].members.array();
      for (var i = 0; i < users.length; i++) {
        (function(userCount) {
          mysqlConn.query("SELECT id FROM user WHERE id = \""+users[userCount].user.id+"\"", (error, results, fields) =>{
            if (results.length == 0) {
              mysqlConn.query("INSERT INTO user(id, username) VALUES (\""+users[userCount].user.id+"\", \""+users[userCount].user.username+"\")", (error, results, fields) => {
                // console.log(error, results, fields);
              });
            }
            mysqlConn.query("SELECT user_id, server_id FROM server_has_user WHERE user_id = \""+users[userCount].user.id + "\" AND server_id = \""+guilds[guildCount].id+"\"", (error, results, fields) =>{
              if (error) {
                console.log(error);
              }
              if (results.length == 0) {
                mysqlConn.query("INSERT INTO server_has_user(server_id, user_id) VALUES (\""+guilds[guildCount].id+"\", \""+users[userCount].user.id+"\")", (error, results, fields) => {
                  // console.log(error, results, fields);
                });
              }
            });
          });
        }(i));
      }
      var roles = guilds[guildCount].roles.array();
      // console.log(roles);
      for (var i = 0; i < roles.length; i++) {
        (function(role) {
          mysqlConn.query("SELECT id FROM role WHERE id = \""+role.id+"\"", (error, results, fields) =>{
            if (error) {
              console.log(error);
            }
            if (results.length == 0 && role.id != guilds[guildCount].defaultRole.id) {
              mysqlConn.query("INSERT INTO role(id, name) VALUES (\""+role.id+"\", \""+role.name+"\")", (error, results, fields) => {
                // console.log(error, results, fields);
                mysqlConn.query("INSERT INTO server_has_role(server_id, role_id) VALUES (\""+guilds[guildCount].id+"\", \""+role.id+"\")", (error, results, fields) => {
                  // console.log(error, results, fields);
                });
              });
            } else {
              updateRole(role);
            }
          });
        }(roles[i]));
      }
    }(i));
  }
}

function updateRoles(guild) {
  updateDB();
  var guildId = guild.id;
  var members = guild.members;
  var roles = guild.roles;
  mysqlConn.query("SELECT * FROM server_has_role INNER JOIN role ON role.id = role_id WHERE server_id = \"" + guildId+"\"", (error, results, fields) => {
    if (error) {
      console.log(error);
    }else {
      for (var i = 0; i < results.length; i++) {
        (function(roleResult) {
          mysqlConn.query("SELECT * FROM server_has_user INNER JOIN user ON user.id = user_id WHERE server_id = \"" + guildId + "\" AND user.lvl >= " + roleResult.lvl, (error, results, fields) => {
            if (error) {
              console.log(error);
            } else {
              for (var i = 0; i < results.length; i++) {
                var member = members.find("id", results[i].id);
                if (member) {
                  member.addRole(roles.find("id", roleResult.id)).catch(console.error);
                }
              }
            }
          });
        }(results[i]));
      }
    }
  });
}

function deleteGuild(guild) {
  updateDB();
  var guildId = guild.id;
  var roles = guild.roles.array();
  mysqlConn.query("DELETE FROM server WHERE id = \""+guildId+"\"", (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      for (var i = 0; i < roles.length; i++) {
        mysqlConn.query("DELETE FROM server_has_role WHERE server_id = \""+guildId+"\"", (error, results, fields) => {
          if (error) {
            console.log(error);
          } else {
            mysqlConn.query("DELETE FROM role WHERE id = \""+roles[i].id+"\"", (error, results, fields) => {
              if (error) {
                console.log(error);
              }
            });
          }
        });
      }
    }
  });
}

function updateGuild(guild) {
  var guildId = guild.id;
  mysqlConn.query("UPDATE server SET name = \""+guild.name+"\" WHERE id = \""+guildId+"\"", (error, results, fields) => {
    if (error) {
      console.log(error);
    }
  });
}

function deleteRole(role) {
  updateDB();
  mysqlConn.query("DELETE FROM server_has_role WHERE role_id = \""+role.id+"\"", (error, results, fields) => {
    if (error) {
      console.log(error);
    } else {
      mysqlConn.query("DELETE FROM role WHERE id = \""+role.id+"\"", (error, results, fields) => {
        if (error) {
          console.log(error);
        }
      });
    }
  });
}

function updateRole(role) {
  mysqlConn.query("UPDATE role SET name = \""+role.name+"\" WHERE id = \""+role.id+"\"", (error, results, fields) => {
    if (error) {
      console.log(error);
    }
  });
}

//when interupt signal is clicked
process.on('SIGINT', function() {
  mysqlConn.end();
  console.log("\nfiles are being deleted");
  fs.emptyDir(__dirname+"/tmp", function(error) {
    if (error) {
      console.error(error);
    }
    console.log("done!");
    process.exit();
  });
});


function getWord(str, count) {
  if (str.indexOf(' ') === -1) {
    return str
  } else {
    if (!count || count === 0) {
      return str.substr(0, str.indexOf(' '));
    } else {
      for (var i = 0; i < count; i++) {
        str = str.substr(str.indexOf(' ')+1, str.length);
        if (str.indexOf(' ') === -1) {
          return str
        } else if((count-1) === i) {
          str = str.substr(0, str.indexOf(' '));
          return str
        }
      }
    }
  }
}

function contains(word, message) {
  if (message.indexOf(word)>-1) {
    return true
  } else {
    return false
  }
}

function between(b, message) {
  message = message.substr(message.indexOf(b)+1, message.length);
  message = message.substr(0, message.indexOf(b));
  return message
}

function countWords(sentence) {
  sentence = sentence.trim().replace(/\s{2,}/g, ' '); //removes unnecessary spaces, because it messed up the program
  var count = 1;
  var lastFound = 0;
  while (sentence.indexOf(" ", lastFound) != -1) {
    lastFound = sentence.indexOf(" ", lastFound)+1;
    count++;
  }
  return count;
}
function countDoubles(sentence) {
  sentence = sentence.trim().replace(/\s{2,}/g, ' '); //removes unnecessary spaces, because it messed up the program
  var count = 0;
  var lastFound = 0;
  sentence += " "; // easy fix, it didn't count the last word before
  while (sentence.indexOf(" ", lastFound) != -1) {
    var lastFoundInner = 0;
    var word = sentence.substring(lastFound, sentence.indexOf(" ", lastFound));
    while (sentence.indexOf(" ", lastFoundInner) != -1) {
      var checkWord = sentence.substring(lastFoundInner, sentence.indexOf(" ", lastFoundInner));
      if (word == checkWord && lastFound != lastFoundInner && lastFound > lastFoundInner) {
        count++;
      }
      // console.log(word, checkWord, count);
      lastFoundInner = sentence.indexOf(" ", lastFoundInner)+1;
    }
    lastFound = sentence.indexOf(" ", lastFound)+1;
  }
  return count;
}
