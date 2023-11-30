import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReloadDataButton from '~/components/reload-data-button';
import { LockerStatus } from '~/interfaces/Locker';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';

export function generateMetadata({ params }: { params: { stationName: string; lockerId: string } }): Metadata {
  return {
    title: `Estación: ${params.stationName} | Locker: ${params.lockerId}`,
    description: 'Locker Hub',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
  };
}

export default async function Locker({ params: { stationName, lockerId } }: { params: { stationName: string; lockerId: string } }) {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  const { locker } = await api.station.getLocker.query({ stationId: stationName, lockerId: parseInt(lockerId, 10) });

  const getLockerState = (state: LockerStatus) => {
    if (state === LockerStatus.RESERVED) {
      return 'Reservado';
    }

    if (state === LockerStatus.CONFIRMED) {
      return 'Confirmado Por Cliente';
    }

    if (state === LockerStatus.LOADING) {
      return 'Confirmado Por Operario';
    }

    if (state === LockerStatus.USED) {
      return 'Cargado';
    }

    return 'Disponible';
  };

  return (
    <div className="mx-auto mt-8 flow-root space-y-4 px-4 sm:px-0">
      <div className="flex items-center justify-end">
        <div className="flex space-x-4">
          <ReloadDataButton />
          <Link
            href={`/stations/${stationName}`}
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
          <div className="mt-1">{locker.nickname}</div>
        </div>

        <div className="px-4 py-2">
          <label htmlFor="state" className="block text-sm font-bold leading-6 text-gray-900">
            Estado
          </label>
          <div className="mt-1">{getLockerState(locker.state)}</div>
        </div>

        <div className="bg-gray-100 px-4 py-2">
          <label htmlFor="open" className="block text-sm font-bold leading-6 text-gray-900">
            ¿Abierto?
          </label>
          <div className="mt-1">{locker.isOpen ? 'Si' : 'No'}</div>
        </div>

        <div className="px-4 py-2">
          <label htmlFor="empty" className="block text-sm font-bold leading-6 text-gray-900">
            ¿Vacio?
          </label>
          <div className="mt-1">{locker.isEmpty ? 'Si' : 'No'}</div>
        </div>

        <div className="bg-gray-100 px-4 py-2">
          <label htmlFor="height" className="block text-sm font-bold leading-6 text-gray-900">
            Altura
          </label>
          <div className="mt-1">{locker.sizes.height}</div>
        </div>

        <div className="px-4 py-2">
          <label htmlFor="width" className="block text-sm font-bold leading-6 text-gray-900">
            Ancho
          </label>
          <div className="mt-1">{locker.sizes.width}</div>
        </div>

        <div className="bg-gray-100 px-4 py-2">
          <label htmlFor="depth" className="block text-sm font-bold leading-6 text-gray-900">
            Profundidad
          </label>
          <div className="mt-1">{locker.sizes.depth}</div>
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
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Id
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Mail Cliente
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Mail Operario
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      ¿Confirmado Por Operario?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      ¿Confirmado Por Cliente?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      ¿Cargada?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      ¿Expirada?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      ¿Completada?
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Usuario
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Creada El
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {locker.reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{reservation.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.clientEmail}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.operatorEmail}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reservation.confirmedOperator ? `Si - ${reservation.confirmedOperatorAt?.toLocaleString('es-CL')}` : 'No'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reservation.confirmedClient ? `Si - ${reservation.confirmedClientAt?.toLocaleString('es-CL')}` : 'No'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reservation.loaded ? `Si - ${reservation.loadedAt?.toLocaleString('es-CL')}` : 'No'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.expired ? 'Si' : 'No'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reservation.completed ? `Si - ${reservation.completedAt?.toLocaleString('es-CL')}` : 'No'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.createdBy}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{reservation.createdAt?.toLocaleString('es-CL')}</td>
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
