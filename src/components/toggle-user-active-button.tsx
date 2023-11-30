'use client';

import { useRouter } from 'next/navigation';
import type { FunctionComponent } from 'react';
import toast from 'react-hot-toast';
import { api } from '~/trpc/react';

interface ToggleUserActiveButtonProps {
  userId: number;
  enabled: boolean;
}

const ToggleUserActiveButton: FunctionComponent<ToggleUserActiveButtonProps> = ({ userId, enabled }) => {
  const router = useRouter();
  const { mutateAsync, isLoading } = api.user.toggleEnabled.useMutation();

  const handleClick = async () => {
    let toggled = false;

    try {
      await toast.promise(mutateAsync({ id: userId }), {
        loading: 'Actualizando...',
        success: () => {
          toggled = true;
          return '¡Actualizado!';
        },
        error: 'Hubo un error actualizando el usuario...',
      });
    } catch (err) {
      // Err
    }

    if (toggled) {
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      className="flex h-10 items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
      onClick={handleClick}
      disabled={isLoading}
    >
      {enabled ? 'Desactivar' : 'Activar'}
    </button>
  );
};

export default ToggleUserActiveButton;
