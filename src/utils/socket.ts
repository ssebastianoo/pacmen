import { io, Socket } from 'socket.io-client';
import type { Player } from './types';

interface ServerToClientEvents {
  move: (data: Player) => void;
  delete: (id: string) => void;
  init(data: Player[]): void;
}

interface ClientToServerEvents {
  move: (data: Player) => void;
  join: (data: {
    room: string;
    coords: Player['coords'];
    color: string;
  }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

const isBrowser = typeof window !== 'undefined';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  isBrowser ? io() : null;
