import { useEffect, useState } from 'react';
import { map } from '@/utils/map';
import { socket } from '@/utils/socket';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Player } from '@/utils/types';
import { useRouter } from 'next/router';

export default function App() {
  const [position, setPosition] = useState({ x: 1, y: 1 });
  const [otherPostions, setOtherPositions] = useState([] as Player[]);
  const [initaliedSpawn, setInitaliedSpawn] = useState(false);
  const [color, setColor] = useState('#fcd56a');
  const [joined, setJoined] = useState(false);
  const [type, setType] = useState<'pacman' | 'ghost'>('pacman');
  const [end, setEnd] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const blockSize = 20;

  useEffect(() => {
    const pos = position;

    function initaliseSpawn() {
      if (!initaliedSpawn) {
        const randomX = Math.floor(Math.random() * map[0].length);
        const randomY = Math.floor(Math.random() * map.length);

        if (map[randomY][randomX] === 0) {
          pos.x = randomX;
          pos.y = randomY;
          setPosition({
            x: pos.x,
            y: pos.y,
          });
          setInitaliedSpawn(true);
        } else {
          initaliseSpawn();
        }
      }
    }
    initaliseSpawn();

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (map[position.y - 1][position.x] === 0) {
            pos.y = pos.y - 1;
          }
          break;
        case 'ArrowDown':
          if (map[position.y + 1][position.x] === 0) {
            pos.y = pos.y + 1;
            break;
          }
          break;
        case 'ArrowLeft':
          if (map[position.y][position.x - 1] === 0) {
            pos.x = pos.x - 1;
          }
          break;
        case 'ArrowRight':
          if (map[position.y][position.x + 1] === 0) {
            pos.x = pos.x + 1;
          }
          break;
      }
      setPosition({
        x: pos.x,
        y: pos.y,
      });
      if (socket) {
        socket.emit('move', {
          coords: pos,
          color,
          room: pathname,
          type,
        });
      }
    };
    if (!end) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, initaliedSpawn, color, pathname, type, otherPostions, end]);

  useEffect(() => {
    if (socket) {
      socket.on('move', (data) => {
        if (otherPostions.find((x) => x.id === data.id)) {
          setOtherPositions(
            otherPostions.map((x) => {
              if (x.id === data.id) {
                return data;
              }
              return x;
            }),
          );
        } else {
          setOtherPositions((prev) => [...prev, data]);
        }
      });

      socket.on('delete', (id) => {
        const dead = otherPostions.find((x) => x.id === id);
        if (dead) {
          setOtherPositions(otherPostions.filter((x) => x.id !== id));
        }
      });

      socket.on('init', (data) => {
        setOtherPositions(data.players.filter((x) => x.id !== socket?.id));
        setType(data.role);
      });

      socket.on('lost', (data) => {
        console.log('lost!');
      });

      if (!joined) {
        if (pathname) {
          socket.emit('join', {
            room: pathname,
            coords: position,
            color,
          });
          setJoined(true);
        }
      }

      socket.on('end', () => {
        setEnd(true);
      });
    }

    return () => {
      if (socket) {
        socket.off('move');
        socket.off('delete');
        socket.off('init');
        socket.off('lost');
        socket.off('end');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherPostions, joined, pathname]);

  return (
    <div>
      {end ? (
        <div className='absolute z-50 bg-[rgba(0,0,0,0.8)] w-full h-screen flex flex-col gap-3 justify-center items-center'>
          <h1 className='text-7xl italic font-bold'>Ghosts won</h1>
          <Button
            size={'lg'}
            onClick={() => {
              router.reload();
            }}
          >
            Play Again
          </Button>
        </div>
      ) : null}
      <div className='flex flex-col gap-2 absolute p-3'>
        <Button
          onClick={(e) => {
            navigator.clipboard.writeText(window.location.href);
            (e.target as HTMLElement).innerText = 'Copied!';
            setTimeout(() => {
              (e.target as HTMLElement).innerText = 'Copy room url';
            }, 1000);
          }}
        >
          Copy room url
        </Button>
        <Input
          type='color'
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            if (socket) {
              socket.emit('move', {
                coords: position,
                color: (e.target as HTMLInputElement).value,
                room: pathname,
                type,
              });
            }
          }}
          style={{
            cursor: 'pointer',
          }}
        />
        <p>
          You are{' '}
          <span className='underline'>
            {type === 'pacman' ? 'pacman' : 'a ghost'}
          </span>
        </p>
      </div>
      <div className='justify-center items-center w-full flex flex-col gap-5 h-screen'>
        <div>
          {map.map((row, i) => (
            <div key={i} className='flex'>
              {row.map((cell, j) => {
                if (position.x === j && position.y === i) {
                  return (
                    <div
                      key={j}
                      style={{
                        width: blockSize,
                        height: blockSize,
                        backgroundColor: color,
                        borderRadius: type === 'pacman' ? '50%' : 0,
                      }}
                    ></div>
                  );
                }

                const otherPlayer = otherPostions.find(
                  (x) => x.coords.x === j && x.coords.y === i,
                );
                if (otherPlayer) {
                  return (
                    <div
                      key={j}
                      style={{
                        width: blockSize,
                        height: blockSize,
                        backgroundColor: otherPlayer.color,
                        borderRadius: otherPlayer.type === 'pacman' ? '50%' : 0,
                      }}
                    ></div>
                  );
                }

                return (
                  <div
                    key={j}
                    style={{
                      width: blockSize,
                      height: blockSize,
                      backgroundColor: cell === 1 ? 'white' : undefined,
                    }}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
