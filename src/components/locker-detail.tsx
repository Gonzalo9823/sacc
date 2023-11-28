import type { FunctionComponent } from 'react';

import type { Locker } from '~/interfaces/Locker';

type LockerDetailProps = {
  locker: Locker;
};

const LockerDetail: FunctionComponent<LockerDetailProps> = ({ locker }) => {
  return (
    <div>
      <div className="bg-gray-100 px-4 py-2">
        <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
          Nombre
        </label>
        <div className="mt-1">{locker.nickname}</div>
      </div>

      <div className="px-4 py-2">
        <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
          Estado
        </label>
        <div className="mt-1">{locker.state}</div>
      </div>

      <div className="bg-gray-100 px-4 py-2">
        <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
          ¿Abierto?
        </label>
        <div className="mt-1">{locker.isOpen ? 'Si' : 'No'}</div>
      </div>

      <div className="px-4 py-2">
        <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
          ¿Vacio?
        </label>
        <div className="mt-1">{locker.isEmpty ? 'Si' : 'No'}</div>
      </div>

      <div className="bg-gray-100 px-4 py-2">
        <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
          Tamaño
        </label>
        <div className="mt-1">
          {locker.sizes.height}x{locker.sizes.width}x{locker.sizes.depth}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
      >
        Desbloquear
      </button>
    </div>
  );
};

export default LockerDetail;
