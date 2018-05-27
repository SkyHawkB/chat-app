const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const onlineUsers = {};

const Discord = require('discord.js');
const client = new Discord.Client();
const botConfig = require('./botConfig.json');
const sendDiscordMessage = (message) => {
  const keys = client.guilds.keyArray();

  for(let i in keys) {
    let guild = client.guilds.get(keys[i]);
    let _ = guild.channels.keyArray();

    for(let ii in _) {
      let channel = guild.channels.get(_[ii]);

      if(channel.name === botConfig.channel) {
        channel.send(message);
      }
    }
  }
};


app.use(express.static(__dirname + '/public'));
http.listen(3000, '0.0.0.0', () => {});
io.on('connection', (socket) => {
  socket.on('message', (message) => {
    io.emit('message', message);

    sendDiscordMessage(message);
  });
  socket.on('join', (user) => {
    onlineUsers[user.id] = user.nick;

    io.emit('userUpdate', onlineUsers);
  });
  socket.on('disconnect', () => {
    let keys = Object.keys(onlineUsers);

    for(let key in keys) {
      if(!io.sockets.sockets.hasOwnProperty(key)) {
        delete onlineUsers[keys[key]];
        break;
      }
    }

    io.emit('userUpdate', onlineUsers);
  });
});

client.on('ready', () => {
  console.log('Discord Integration Active!');
});
client.on('message', (message) => {
  if(!message.guild || message.author.bot) return;
  if(message.channel.name !== botConfig.channel) return;

  let nick = message.member.displayName.replace(/[^A-Za-z0-9 ]/g, '');
  if(nick.length < 2) {
    nick = 'Relay';
  } else if(nick.length > 20) {
    nick = nick.substring(0, 17) + '...';
  }

  io.emit('message', nick + ': ' + message.content);

  const keys = client.guilds.keyArray();
  for(let i in keys) {
    let guild = client.guilds.get(keys[i]);
    let _ = guild.channels.keyArray();

    for(let ii in _) {
      let channel = guild.channels.get(_[ii]);

      if(channel.name === botConfig.channel && channel !== message.channel) {
        channel.send(nick + ': ' + message.content);
      }
    }
  }
});
client.login(botConfig.token);
