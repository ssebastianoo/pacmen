import { io, Socket } from 'socket.io-client';
import type {
  Player,
  ServerToClientEvents,
  ClientToServerEvents,
} from './types';

const isBrowser = typeof window !== 'undefined';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  isBrowser ? io() : null;
