var Discord = require('discord.io');
var fs = require('fs');
var http = require('http');

var bot = new Discord.Client({
  autorun: true,
  token: ""
});

var servers ;
var channels = [];

bot.on('ready', function(event) {
  console.log('Logged in as %s - %s - is bot %s\n', bot.username, bot.id, bot.bot);
  servers = Object.getOwnPropertyNames(bot.servers);
  for (var i = 0; i < servers.length; i++) {
    channels.push(Object.getOwnPropertyNames(bot.servers[servers[i]]["channels"]));
  }
  console.log("channels:");
  console.log(channels);
});

bot.on('message', function(user, userID, channelID, message, event) {
  if (userID != bot.id) {
    if (message == "ping") {
      bot.sendMessage({
        to: channelID,
        message: "pong",
        typing: true
      });
    }
    if (message == "deleteMessages") {
      bot.getMessages({
        channelID: channelID
      }, function(error, messageArray) {
        messageIDs = [];
        for (var i = 0; i < messageArray.length; i++) {
          messageIDs.push(messageArray[i].id);
        }
        bot.deleteMessages({
          channelID: channelID,
          messageIDs: messageIDs
        }, function(error) {
          console.error(error);
        });
      });
    }
    if (message == "getServers") {
      console.log(bot.servers);
    }
    if (getWord(message) == "join") {
      var voiceChannelId;
      for (var i = 0; i < servers.length; i++) {
        for (var j = 0; j < channels[i].length; j++) {
          if (channelID == channels[i][j]) {
            for (var k = 0; k < channels[i].length; k++) {
              if (getWord(message, 1) == bot.servers[servers[i]]['channels'][channels[i][k]]['name'] && bot.servers[servers[i]]['channels'][channels[i][k]]['type'] == 'voice') {
                voiceChannelId = channels[i][k];
              }
            }
          }
        }
      }
      if (voiceChannelId == null) {
        bot.sendMessage({
          to: channelID,
          message: 'invalid channel name'
        })
      }else {
        bot.joinVoiceChannel(voiceChannelId, function(error, events) {
          if (error) {
            console.error(error);
          }
          bot.getAudioContext(voiceChannelId, function(error, stream) {
            if (error) {
              console.error(error);
            }

            var rStream = fs.createReadStream('music/timeflies.mp3').pipe(stream, {end: false});

            stream.on('done', function() {
              console.log("done!");
            });
          });
        });
      }
    }
    if (getWord(message) == "play" && getWord(message, 1) == "music") {
      bot.sendMessage({
        to: channelID,
        message: "kan nog niet"
      })
    }
    if (getWord(message) == "leave") {
      var voiceChannelId;
      for (var i = 0; i < servers.length; i++) {
        for (var j = 0; j < channels[i].length; j++) {
          if (channelID == channels[i][j]) {
            for (var k = 0; k < channels[i].length; k++) {
              if (getWord(message, 1) == bot.servers[servers[i]]['channels'][channels[i][k]]['name']&& bot.servers[servers[i]]['channels'][channels[i][k]]['type'] == 'voice') {
                voiceChannelId = channels[i][k];
              }
            }
          }
        }
      }
      if (voiceChannelId == null) {
        bot.sendMessage({
          to: channelID,
          message: "invalid channel name"
        });
      }else {
        bot.leaveVoiceChannel(voiceChannelId, function() {

        });
      }
    }
    if (contains("cat", message) || contains("miauw", message) || contains("pussy", message)) {
      var url = 'http://random.cat/meow';

      http.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
          body += chunk;
        });

        res.on('end', function(){
          var response = JSON.parse(body);
          console.log("Got a response: ", response.file);
          bot.sendMessage({
            to: channelID,
            message: response.file
          });
        });
      }).on('error', function(e){
        console.log("Got an error: ", e);
      });
    }
    if (getWord(message) == "spam") {
      var id = getWord(message, 1);
      id = id.substr(2, id.length-3);
      var msg = between('"', message);
      var amount = getWord(message, 2);
      for (var i = 0; i < amount; i++) {
        var end = Date.now() + 1000;
        while (Date.now() < end) {

        }
        bot.sendMessage({
          to: id,
          message: msg
        }, function(error, events) {
          console.error(error);
          console.log(events);
        });
      }
    }
  }
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
        console.log(str, i, count, str.indexOf(" "));
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
