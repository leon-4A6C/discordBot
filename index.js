const Discord = require("discord.js");
const bot = new Discord.Client();
const http = require('http');
const Cleverbot = require("cleverbot-node");
const helpFile = require('./help');

var cleverbots = [new Cleverbot()];
cleverbots[0].configure({botapi: "TOKEN"});
var sessions = [{username: "peteadawdadawdawdawdwadrgbrrr", cleverbotId: 0}];
bot.on('ready', () => {
  console.log("logged in as " + bot.user.username + "!");
});

bot.on("message", msg => {
  if (msg.author != bot.user) { // if this is not here it would respond to itself
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
    if (getWord(msg.content) === "<@"+bot.user.id+">") {
      var found = false;
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].username === msg.author.username) {
          talkBot(between('"', msg.content), sessions[i].cleverbotId);
          found = true;
          break;
        }
      }
      if (!found) {
        sessions.push({username: msg.author.username, cleverbotId: cleverbots.length});
        cleverbots.push(new Cleverbot());
        cleverbots[cleverbots.length-1].configure({botapi: "TOKEN"});
        talkBot(between('""', msg.content), cleverbots.length-1);
      }
      function talkBot(message, id) {
        cleverbots[id].write(message, function (response) {
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

bot.login("TOKEN");

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
