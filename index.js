const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const Collection = require('./Collection.js');

const onlineUsers = new Collection();

fs.writeFileSync('./logs/events.log', 'Server started! ');
const log = (message) => {
  fs.appendFileSync('./logs/events.log', `${message}\n`);
}

app.use(express.static(__dirname + '/public'));
http.listen(3000, '0.0.0.0', () => {
  log('Listening on *:3000!');
});

io.on('connection', (socket) => {
  console.log(socket.id);

  socket.on('message', (message) => {
    log(`Message sent: "${message}"!`);

    io.emit('message', message);
  });
  socket.on('join', (nickname) => {
    onlineUsers.add(nickname);

    io.emit('userUpdate', onlineUsers);
  });
});
