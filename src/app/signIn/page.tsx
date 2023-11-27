import Link from 'next/link';
import React from 'react';
import UserSignIn from '~/app/_components/UserSignIn/UserSignIn.js';


import { getServerAuthSession } from '~/server/auth';

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
       <UserSignIn />



    </main>
  );
}
