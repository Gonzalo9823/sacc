import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';

export const metadata = {
  title: 'Estaciones',
  description: 'Locker Hub',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function Dashboard() {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  return (
    <div>
      <h1>Hola, {session.user.email}</h1>
    </div>
  );
}
