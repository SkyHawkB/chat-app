const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const onlineUsers = {};

fs.writeFileSync('./logs/events.log', 'Server started! ');
const log = (message) => {
  fs.appendFileSync('./logs/events.log', `${message}\n`);
}

app.use(express.static(__dirname + '/public'));
http.listen(3000, '0.0.0.0', () => {
  log('Listening on *:3000!');
});

io.on('connection', (socket) => {
  socket.on('message', (message) => {
    log(`Message sent: "${message}"!`);

    io.emit('message', message);
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
