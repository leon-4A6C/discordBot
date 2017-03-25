var Discord = require('discord.io');
var fs = require('fs');
var http = require('http');

var bot = new Discord.Client({
  autorun: true,
  token: "PLACE TOKEN HERE"
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
  var firstWord = getFirstWord(message);
  var lastWord = getLastWord(message);

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
        //console.log("\nid: "+messageArray[i].id + "\nmessage: " + messageArray[i].content+ "\ni: " + i);
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
  if (firstWord == "join") {
    var voiceChannelId;
    for (var i = 0; i < servers.length; i++) {
      for (var j = 0; j < channels[i].length; j++) {
        if (channelID == channels[i][j]) {
          for (var k = 0; k < channels[i].length; k++) {
            if (lastWord == bot.servers[servers[i]]['channels'][channels[i][k]]['name'] && bot.servers[servers[i]]['channels'][channels[i][k]]['type'] == 'voice') {
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
  if (firstWord == "play" && lastWord == "music") {
    bot.sendMessage({
      to: channelID,
      message: "kan nog niet"
    })
  }
  if (firstWord == "leave") {
    var voiceChannelId;
    for (var i = 0; i < servers.length; i++) {
      for (var j = 0; j < channels[i].length; j++) {
        if (channelID == channels[i][j]) {
          for (var k = 0; k < channels[i].length; k++) {
            if (lastWord == bot.servers[servers[i]]['channels'][channels[i][k]]['name']&& bot.servers[servers[i]]['channels'][channels[i][k]]['type'] == 'voice') {
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
      })
    }else {
      bot.leaveVoiceChannel(voiceChannelId, function() {

      });
    }
  }
  if (message == "cat" || message == "pussy" || message == "miauw") {
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
});


function getFirstWord(str) {
  if (str.indexOf(' ') === -1) {
    return str
  } else {
    return str.substr(0, str.indexOf(' '));
  }
}

function getLastWord(str) {
  if (str.indexOf(' ') === -1) {
    return str
  } else {
    return str.substr(str.indexOf(' ')+1, str.length);
  }
}
