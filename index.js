const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
fs.writeFileSync('./logs/events.log', 'Server started! ');
const log = (message) => {
  fs.appendFileSync('./logs/events.log', `${message}\n`);
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
http.listen(3000, '0.0.0.0', () => {
  log('Listening on *:3000!');
});

io.on('connection', (socket) => {
  log('User connected!');
  socket.broadcast.emit('A user has joined the chat!');

  socket.on('disconnect', () => {
    log('User disconnected!');
    socket.broadcast.emit('A user has left the chat!');
  });
  socket.on('message', (message) => {
    log(`Message sent: "${message}"!`);
    io.emit('message', message);
  });
});
