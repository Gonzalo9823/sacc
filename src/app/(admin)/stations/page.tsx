import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import { api } from '~/trpc/server';

export const metadata = {
  title: 'Estaciones',
  description: 'Locker Hub',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function Stations() {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  const { stations } = await api.station.getMany.query();

  return (
    <div className="mx-auto mt-8 flow-root px-4 sm:px-0">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    N˚ de Lockers
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Ver</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {stations.map((station) => (
                  <tr key={station.stationId}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{station.stationId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{station.lockers.length}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/stations/${station.stationId}`} className="text-red-600 hover:text-red-700">
                        Ver<span className="sr-only">, {station.stationId}</span>
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
