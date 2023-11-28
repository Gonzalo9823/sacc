import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReloadDataButton from '~/components/reload-data-button';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';

export function generateMetadata({ params }: { params: { stationId: string } }): Metadata {
  return {
    title: `Estación: ${params.stationId}`,
    description: 'Locker Hub',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
  };
}

export default async function Station({ params: { stationId } }: { params: { stationId: string } }) {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  const { station } = await api.station.get.query({ id: stationId });

  return (
    <div className="mx-auto mt-8 flow-root space-y-4 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Lockers:</h1>
        <ReloadDataButton />
      </div>
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Nombre
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    ¿Abierto?
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    ¿Vacio?
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Alturo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Ancho
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Profundidad
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Ver</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {station.lockers.map((locker) => (
                  <tr key={locker.nickname}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.nickname}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.state}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.isOpen ? 'Si' : 'No'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.isEmpty ? 'Si' : 'No'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.sizes.height}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.sizes.width}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{locker.sizes.depth}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href="#" className="text-red-600 hover:text-red-700">
                        Reservar<span className="sr-only">, {locker.nickname}</span>
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
