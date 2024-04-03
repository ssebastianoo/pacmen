import { useEffect, useRef, useState } from 'react';
import { map } from '@/utils/map';

export default function App() {
  const [position, setPosition] = useState({ x: 1, y: 1 });
  const [listener, setListener] = useState(false);

  // make a type that only accepts 1 or 0

  const blockSize = 20;
  const sizes = {
    0: 20,
    1: 20,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (map[position.y - 1][position.x] === 0) {
            setPosition((prev) => ({
              x: prev.x,
              y: prev.y - 1,
            }));
          }
          break;
        case 'ArrowDown':
          if (map[position.y + 1][position.x] === 0) {
            setPosition((prev) => ({
              x: prev.x,
              y: prev.y + 1,
            }));
          }
          break;
        case 'ArrowLeft':
          if (map[position.y][position.x - 1] === 0) {
            setPosition((prev) => ({
              x: prev.x - 1,
              y: prev.y,
            }));
          }
          break;
        case 'ArrowRight':
          if (map[position.y][position.x + 1] === 0) {
            setPosition((prev) => ({
              x: prev.x + 1,
              y: prev.y,
            }));
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position]);

  return (
    <div className='justify-center items-center w-full flex h-screen'>
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
                      backgroundColor: 'yellow',
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
