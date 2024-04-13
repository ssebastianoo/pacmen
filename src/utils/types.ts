export type Player = {
  coords: { x: number; y: number };
  color: string;
  room?: string;
  id?: string;
  type?: 'pacman' | 'ghost';
};

export type ServerToClientEvents = {
  move: (data: Player) => void;
  delete: (id: string) => void;
  init(data: { players: Player[]; role: 'pacman' | 'ghost' }): void;
  lost: (data: { killer: string; dead: string }) => void;
  end: () => void;
};

export type ClientToServerEvents = {
  move: (data: Player) => void;
  join: (data: {
    room: string;
    coords: Player['coords'];
    color: string;
  }) => void;
  gotcha: () => void;
};
