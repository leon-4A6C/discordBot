const Discord = require("discord.js");
const bot = new Discord.Client();
const http = require('http');
const Cleverbot = require("cleverbot-node");
const fs = require("fs-extra");
const youtubedl = require("youtube-dl");
const ffmpeg = require("fluent-ffmpeg");
const helpFile = require('./help');

var discordToken = "DISCORD_TOKEN";
var cleverbotToken = "CLEVERBOT_TOKEN";

var cleverbots = [{username: "peteadawdadawdawdawdwadrgbrrr", cleverbot: new Cleverbot()}];
cleverbots[0].cleverbot.configure({botapi: cleverbotToken});
bot.on('ready', () => {
  console.log("logged in as " + bot.user.username + "!");
});

bot.on("message", msg => {
  if (msg.author != bot.user) { // if this is not here it would respond to itself
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

//when interupt signal is clicked
process.on('SIGINT', function() {
  console.log("files are being deleted");
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
