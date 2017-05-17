const Discord = require("discord.js");
const bot = new Discord.Client();
const http = require('http');
const Cleverbot = require("cleverbot-node");
const fs = require("fs-extra");
const youtubedl = require("youtube-dl");
const ffmpeg = require("fluent-ffmpeg");
const helpFile = require('./help');
const mysql = require('mysql');
var mysqlConn = mysql.createConnection({
  host: "localhost",
  user: "test",
  password: "test",
  database: "DiscordBot"
});
mysqlConn.connect();

var discordToken = "MjY5MTg3NTg1MjIwMjgwMzIw.C_zhnQ.A-APFPHEL-8RZIaejuddqxGu1mc";
var cleverbotToken = "CLEVERBOT_TOKEN";

var cleverbots = [{username: "peteadawdadawdawdawdwadrgbrrr", cleverbot: new Cleverbot()}];
cleverbots[0].cleverbot.configure({botapi: cleverbotToken});
bot.on('ready', () => {
  console.log("logged in as " + bot.user.username + "!");
  updateDB();
});

bot.on("guildMemberAdd", member => {
  // add user to db
  updateDB();
});

bot.on("guildCreate", guild => {
  updateDB();
});

bot.on("message", msg => {
  if (msg.author != bot.user) { // if this is not here it would respond to itself
    mysqlConn.query("UPDATE user SET xp = xp+"+ (countWords(msg.content)-countDoubles(msg.content))+" WHERE id = "+msg.author.id, (error, result, fields)=>{
      // console.log(error, result, fields);
    });
    if (getWord(msg.content) === "stats") {
      mysqlConn.query("SELECT xp, lvl FROM user WHERE id = "+ msg.author.id, (error, results, fields)=>{
        msg.reply("these are your stats: \nxp: " + results[0].xp + "\nlvl: " + results[0].lvl);
      });
    }
    if (getWord(msg.content) === "deleteHistory") {
      var found = false;
      for (var i = 0; i < cleverbots.length; i++) {
        if (cleverbots[i].username === msg.author.username) {
          found = true;
          cleverbots.splice(i, 1);
          break;
        }
      }
      if (!found) {
        msg.reply("you have got no chat history");
      }
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
        // TODO: spam iedereen
      }
      for (var i = 0; i < mentions.length; i++) {
        msg.channel.send(mentions[i].username +  " is being spammed!");
        for (var j = 0; j < amount; j++) {
          mentions[i].send(message);
        }
      }
    }
    if (getWord(msg.content) === "<@!"+bot.user.id+">") {
      var found = false;
      for (var i = 0; i < cleverbots.length; i++) {
        if (cleverbots[i].username === msg.author.username) {
          talkBot(between('"', msg.content), cleverbots[i].cleverbot);
          found = true;
          break;
        }
      }
      if (!found) {
        cleverbots.push({username: msg.author.username, cleverbot:new Cleverbot()});
        cleverbots[cleverbots.length-1].cleverbot.configure({botapi: cleverbotToken});
        talkBot(between('""', msg.content), cleverbots[cleverbots.length-1].cleverbot);
      }
      function talkBot(message, cleverbot) {
        cleverbot.write(message, function (response) {
          msg.reply(response.output);
        });
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
      mysqlConn.query("SELECT id FROM server WHERE id = "+guilds[guildCount].id, (error, results, fields) =>{
        if (results.length == 0) {
          mysqlConn.query("INSERT INTO server(id, name) VALUES ("+guilds[guildCount].id+", \""+guilds[guildCount].name+"\")", (error, results, fields) => {
            // console.log(error, results, fields);
          });
        }
      });
      var users = guilds[guildCount].members.array();
      for (var i = 0; i < users.length; i++) {
        (function(userCount) {
          mysqlConn.query("SELECT id FROM user WHERE id = "+users[userCount].user.id, (error, results, fields) =>{
            if (results.length == 0) {
              mysqlConn.query("INSERT INTO user(id, username, xp, lvl) VALUES ("+users[userCount].user.id+", \""+users[userCount].user.username+"\", 0, 0)", (error, results, fields) => {
                // console.log(error, results, fields);
              });
            }
            mysqlConn.query("SELECT user_id, server_id FROM server_has_user WHERE user_id = "+users[userCount].user.id + " AND server_id = "+guilds[guildCount].id, (error, results, fields) =>{
              if (results.length == 0) {
                mysqlConn.query("INSERT INTO server_has_user(server_id, user_id) VALUES ("+guilds[guildCount].id+", "+users[userCount].user.id+")", (error, results, fields) => {
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
        (function(rolesCount) {
          mysqlConn.query("SELECT id FROM roles WHERE id = "+roles[rolesCount].id, (error, results, fields) =>{
            if (results.length == 0) {
              mysqlConn.query("INSERT INTO roles(id, name) VALUES ("+roles[rolesCount].id+", \""+roles[rolesCount].name+"\")", (error, results, fields) => {
                // console.log(error, results, fields);
                mysqlConn.query("INSERT INTO server_has_roles(server_id, roles_id) VALUES ("+guilds[guildCount].id+", "+roles[rolesCount].id+")", (error, results, fields) => {
                  // console.log(error, results, fields);
                });
              });
            }
          });
        }(i));
      }
    }(i));
  }
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
  var count = 1;
  var lastFound = 0;
  while (sentence.indexOf(" ", lastFound) != -1) {
    lastFound = sentence.indexOf(" ", lastFound)+1;
    count++;
  }
  return count;
}

function countDoubles(sentence) {
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
