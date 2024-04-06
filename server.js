import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
let players = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('disconnecting', () => {
      const player = players[socket.id];
      if (!player) return;
      socket.leave(player.room);
      socket.broadcast.to(player.room).emit('delete', socket.id);
      delete players[socket.id];
    });

    socket.on('join', (data) => {
      socket.join(data.room);
      players[socket.id] = {
        room: data.room,
        coords: data.coords,
        color: data.color,
        id: socket.id,
      };

      socket.broadcast.to(data.room).emit('move', {
        coords: data.coords,
        color: data.color,
        id: socket.id,
      });

      socket.emit('init', {
        players: Object.values(players),
      });
    });

    socket.on('move', (data) => {
      const player = players[socket.id];
      if (!player) {
        player[socket.id] = {
          room: data.room,
          coords: data.coords,
          color: data.color,
          id: socket.id,
        };
      } else {
        player.coords = data.coords;
        player.color = data.color;
      }

      socket.broadcast.to(data.room).emit('move', {
        coords: data.coords,
        color: data.color,
        id: socket.id,
      });
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
