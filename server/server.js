
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map(); // socket.id => username

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('new user', (username) => {
    users.set(socket.id, username);
    io.emit('users online', Array.from(users.values()));
  });

  socket.on('chat message', ({ from, message, to }) => {
    if (to === 'all') {
      io.emit('chat message', { from, message, to });
    } else {
      // send private message
      for (let [id, username] of users) {
        if (username === to || username === from) {
          io.to(id).emit('chat message', { from, message, to });
        }
      }
    }
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('users online', Array.from(users.values()));
    console.log('user disconnected', socket.id);
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});
