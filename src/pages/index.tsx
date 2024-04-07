import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [code, setCode] = useState('');
  const router = useRouter();

  return (
    <div className='flex justify-center items-center h-screen flex-col gap-3'>
      <h1 className='text-3xl'>PacMen</h1>
      <div className='flex gap-2'>
        <Input
          placeholder='Room code'
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (code.length === 0) return;
              router.push('/game/' + code);
            }
          }}
        />
        <Button
          onClick={() => {
            if (code.length === 0) return;
            router.push('/game/' + code);
          }}
        >
          Join
        </Button>
      </div>
    </div>
  );
}
