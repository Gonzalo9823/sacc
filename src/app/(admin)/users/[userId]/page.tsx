import { UserRole } from '@prisma/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReloadDataButton from '~/components/reload-data-button';
import ToggleUserActiveButton from '~/components/toggle-user-active-button';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  const { user } = await api.user.get.query({ id: parseInt(params.userId, 10) });

  return {
    title: `Usuario: ${user.name}`,
    description: 'Locker Hub',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
  };
}

export default async function User({ params }: { params: { userId: string } }) {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  const { user } = await api.user.get.query({ id: parseInt(params.userId, 10) });

  return (
    <div className="mx-auto mt-8 flow-root space-y-4 px-4 sm:px-0">
      <div className="flex items-center justify-end">
        <div className="flex space-x-4">
          <ToggleUserActiveButton enabled={user.enabled} userId={user.id} />
          <ReloadDataButton />
          <Link
            href="/users"
            className="flex h-10 items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
          >
            Volver
          </Link>
        </div>
      </div>

      <div>
        <div className="bg-gray-100 px-4 py-2">
          <label htmlFor="name" className="block text-sm font-bold leading-6 text-gray-900">
            Nombre
          </label>
          <div className="mt-1">{user.name}</div>
        </div>

        <div className="px-4 py-2">
          <label htmlFor="email" className="block text-sm font-bold leading-6 text-gray-900">
            Mail
          </label>
          <div className="mt-1">{user.email}</div>
        </div>

        <div className="bg-gray-100 px-4 py-2">
          <label htmlFor="active" className="block text-sm font-bold leading-6 text-gray-900">
            ¿Activo?
          </label>
          <div className="mt-1">{user.enabled ? 'Si' : 'No'}</div>
        </div>

        <div className="px-4 py-2">
          <label htmlFor="role" className="block text-sm font-bold leading-6 text-gray-900">
            Rol
          </label>
          <div className="mt-1">{user.role === UserRole.ADMIN ? 'Admin' : 'Usuario'}</div>
        </div>
      </div>

      <div>
        <h1 className="pb-5 text-xl font-bold">Reservas:</h1>

        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Estación
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Locker
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      ¿Expirada?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      ¿Completada?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Creada el
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {user.reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{reservation.stationName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.lockerId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.expired ? 'Si' : 'No'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.completed ? 'Si' : 'No'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.createdAt.toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
