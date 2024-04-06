import { useEffect, useState } from 'react';
import { map } from '@/utils/map';
import { socket } from '@/utils/socket';
import { useRouter } from 'next/router';

export default function App() {
  const [position, setPosition] = useState({ x: 1, y: 1 });
  const [otherPostions, setOtherPositions] = useState([]);
  const [initaliedSpawn, setInitaliedSpawn] = useState(false);
  const [color, setColor] = useState('#fcd56a');
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

    const handleKeyDown = (e) => {
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
      socket.emit('move', {
        coords: pos,
        color,
        room: router.query.id,
      });
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, initaliedSpawn, color, router]);

  useEffect(() => {
    if (socket) {
      socket.on('move', (data) => {
        console.log(data);
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
        console.log('someone died');
        const dead = otherPostions.find((x) => x.id === id);
        if (dead) {
          setOtherPositions(otherPostions.filter((x) => x.id !== id));
        }
      });

      socket.emit('join', {
        room: router.query.id,
        coords: position,
        color,
      });
    }
    return () => {
      socket.off('move');
      socket.off('delete');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherPostions]);

  return (
    <div className='justify-center items-center w-full flex h-screen flex-col gap-5'>
      <input
        type='color'
        value={color}
        className='text-black'
        onChange={(e) => {
          setColor(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            socket.emit('move', {
              coords: position,
              color: e.target.value,
            });
          }
        }}
      />
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
  );
}
