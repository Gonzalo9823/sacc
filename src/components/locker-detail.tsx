'use client';

import { useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import toast from 'react-hot-toast';
import type { Locker } from '~/interfaces/Locker';
import { api } from '~/trpc/react';

type LockerDetailProps = {
  locker: Locker & { loaded: boolean; confirmedOperator: boolean };
  type: 'client' | 'operator';
  password: string;
};

const LockerDetail: FunctionComponent<LockerDetailProps> = ({ locker, password, type }) => {
  const { isLoading: isLoadingOpen, mutateAsync } = api.locker.open.useMutation();
  const { isLoading: isLoadingCancel, mutateAsync: cancel } = api.reservation.cancel.useMutation();

  const isLoading = isLoadingOpen || isLoadingCancel;
  const router = useRouter();

  const handleOpen = async () => {
    let opened = false;

    try {
      await toast.promise(mutateAsync({ password, type }), {
        loading: 'Abriendo...',
        success: () => {
          opened = true;
          return '¡Abierto!';
        },
        error: 'Hubo un error abriendo...',
      });
    } catch (err) {
      // Nothing
    }

    if (opened) {
      router.push('/');
    }
  };

  const handleCancel = async () => {
    let canceled = false;

    try {
      await toast.promise(cancel({ password, type }), {
        loading: 'Cancelando...',
        success: () => {
          canceled = true;
          return '¡Cancelada!';
        },
        error: 'Hubo un error cancelando...',
      });
    } catch (err) {
      // Nothing
    }

    if (canceled) {
      router.push('/');
    }
  };

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
          Tamaño
        </label>
        <div className="mt-1">
          {locker.sizes.height}x{locker.sizes.width}x{locker.sizes.depth}
        </div>
      </div>

      <div className="flex space-x-2">
        {type === 'operator' ? (
          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
            onClick={() => handleCancel()}
            disabled={isLoading || (type === 'operator' && locker.loaded)}
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
          onClick={() => handleOpen()}
          disabled={isLoading || (type === 'client' && !locker.loaded) || (type === 'operator' && locker.loaded)}
        >
          Desbloquear
        </button>
      </div>
    </div>
  );
};

export default LockerDetail;
