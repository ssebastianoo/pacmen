import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import type {
  Player,
  ServerToClientEvents,
  ClientToServerEvents,
} from './src/utils/types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
let port = process.env.PORT || 3000;

if (typeof port === 'string') {
  port = parseInt(port);
}

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
let players: {
  [key: string]: Player;
} = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

  io.on('connection', (socket) => {
    socket.on('disconnecting', () => {
      const player = players[socket.id];
      if (!player) return;
      if (player.room) {
        socket.leave(player.room);
        socket.broadcast.to(player.room).emit('delete', socket.id);
      }
      delete players[socket.id];
    });

    socket.on('disconnect', () => {
      const player = players[socket.id];
      if (!player) return;
      if (player.room) {
        socket.leave(player.room);
        socket.broadcast.to(player.room).emit('delete', socket.id);
      }
      delete players[socket.id];
    });

    socket.on('join', (data) => {
      const room = Object.values(players).find((x) => x.room === data.room);

      socket.join(data.room);
      players[socket.id] = {
        room: data.room,
        coords: data.coords,
        color: data.color,
        id: socket.id,
        type: room ? 'ghost' : 'pacman',
      };

      socket.broadcast.to(data.room).emit('move', {
        coords: data.coords,
        color: data.color,
        id: socket.id,
      });

      socket.emit('init', {
        players: Object.values(players),
        role: room ? 'ghost' : 'pacman',
      });
    });

    socket.on('move', (data) => {
      const player = players[socket.id];
      if (!player) {
        const room = Object.values(players).find((x) => x.room === data.room);
        players[socket.id] = {
          room: data.room,
          coords: data.coords,
          color: data.color,
          id: socket.id,
          type: room ? 'ghost' : 'pacman',
        };
      } else {
        player.coords = data.coords;
        player.color = data.color;
      }

      const check = Object.values(players).filter(
        (x) => x.coords.x === data.coords.x && x.coords.y === data.coords.y,
      );
      if (check.length > 1) {
        const pacman = check.find((x) => x.type === 'pacman');
        const ghost = check.find((x) => x.type === 'ghost');

        if (pacman && ghost && player.room) {
          const roomPlayers = Object.values(players).filter(
            (x) => x.room === data.room,
          );
          for (const player of roomPlayers) {
            delete players[player.id!];
          }

          io.to(player.room).emit('end');
        }
      }

      if (data.room) {
        socket.broadcast.to(data.room).emit('move', {
          coords: data.coords,
          color: data.color,
          id: socket.id,
          type: data.type,
        });
      }
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
