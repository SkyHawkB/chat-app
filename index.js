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
const fs = require('fs');
const moment = require('moment');
const colors = require('colors');
const timestamp = () => {
  return moment().format('MM-DD-YYYY HH:MM:SS') + ' > ';
};
const log = (message, file) => {
  if(fs.existsSync(`./logs/${file}.log`)) {
    fs.appendFileSync(`./logs/${file}.log`, '\n' + timestamp() + message);
  } else {
    fs.writeFileSync(`./logs/${file}.log`, timestamp() + message);
  }
};

app.use(express.static(__dirname + '/public'));
http.listen(3000, '0.0.0.0', () => {
  log('Server Started!', 'events');
});
io.on('connection', (socket) => {
  socket.on('message', (message) => {
    io.emit('message', message);

    log('Message sent!', 'events');
    log(message, 'messages');

    sendDiscordMessage(message);
  });
  socket.on('join', (user) => {
    onlineUsers[user.id] = user.nick;

    log(`"${user.nick}" joined the chat!`, 'events');

    io.emit('userUpdate', onlineUsers);
  });
  socket.on('disconnect', () => {
    let keys = Object.keys(onlineUsers);

    for(let key in keys) {
      if(!io.sockets.sockets.hasOwnProperty(key)) {
        log(`"${onlineUsers[keys[key]]}" left the chat!`, 'events');

        delete onlineUsers[keys[key]];
        break;
      }
    }

    io.emit('userUpdate', onlineUsers);
  });
});

client.on('ready', () => {
  console.log(colors.green('Discord Integration Active!'));
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
client.on("error", (error) => {
  const timestamp = moment().format('YYYY-MM-DD HH-MM-SS');
  fs.writeFileSync(`./logs/error/${timestamp}.log`);
  console.log(colors.red(`The program encountered an error!`));
  console.log(colors.yellow(`More information can be found at "./logs/error/${timestamp}.log" !`));
});
client.login(botConfig.token);
