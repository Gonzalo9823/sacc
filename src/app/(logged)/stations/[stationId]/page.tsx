'use client';
import Link from 'next/link';
import { redirect, useRouter, usePathname } from 'next/navigation';
// import { getServerAuthSession } from '~/server/auth';
// import { api } from '~/trpc/server';
import { memoryDb } from '~/server/memory-db';



export default async function Station() {
//   const session = await getServerAuthSession();
//   if (!session) redirect('/');

  const stations  = memoryDb.stations

  const router = useRouter();
  const pathname = usePathname()?.split('/')[2];

  const lockers = stations?.find((station) => station.stationId === pathname)?.lockers;



  return (
<>
            <h1> Estacion: {pathname}</h1>

            <h2> Lockers: </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {lockers?.map((locker) => (
                    <div key={locker.nickname} style={{ border: '1px solid gray', padding: '10px', minWidth: '200px', borderRadius: '10px' }}>
                        <h3>Locker {locker.nickname}</h3>
                        <p>Locker status: {locker.state}</p>
                        <p>Locker is empty: {locker.isEmpty}</p>
                        <p>Locker is open: {locker.isOpen}</p>
                        <p>Locker height: {locker.sizes['height']}</p>
                        <p>Locker width: {locker.sizes['width']}</p>
                        <p>Locker depth: {locker.sizes['depth']}</p>

                    </div>
                ))}
            </div>
        </>
    
  );
}
