import { Inter } from 'next/font/google';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex justify-center items-center h-screen flex-col gap-3'>
      <h1 className='text-3xl'>PacMen</h1>
      <Link href='/app' className={buttonVariants({ size: 'lg' })}>
        Play
      </Link>
    </div>
  );
}
