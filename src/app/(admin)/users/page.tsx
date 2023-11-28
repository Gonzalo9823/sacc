import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReloadDataButton from '~/components/reload-data-button';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';

export const metadata = {
  title: 'Usuarios',
  description: 'Locker Hub',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function Users() {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  const { users } = await api.user.getMany.query();

  return (
    <div className="mx-auto mt-8 flow-root space-y-4 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <h1 className="pointer-events-none text-xl font-bold text-white">Lockers:</h1>
        <ReloadDataButton />
      </div>
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Mail
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    ¿Activo?
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Ver</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.email}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.enabled ? 'Si' : 'No'}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/users/${user.id}`} className="text-red-600 hover:text-red-700">
                        Ver<span className="sr-only">, {user.email}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
