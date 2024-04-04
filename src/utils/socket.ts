import { io, Socket } from 'socket.io-client';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

const isBrowser = typeof window !== 'undefined';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  isBrowser ? io() : null;
