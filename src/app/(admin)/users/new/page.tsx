import Link from 'next/link';
import { redirect } from 'next/navigation';
import NewUserForm from '~/components/new-user-form';
import { getServerAuthSession } from '~/server/auth';

export const metadata = {
  title: 'Nuevo Usuario',
  description: 'Locker Hub',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function NewUser() {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  return (
    <div className="mx-auto mt-8 flow-root space-y-4 px-4 sm:px-0">
      <div className="flex items-center justify-end">
        <div className="flex space-x-4">
          <Link
            href="/users"
            className="flex h-10 items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
          >
            Volver
          </Link>
        </div>
      </div>
      <NewUserForm />
    </div>
  );
}
