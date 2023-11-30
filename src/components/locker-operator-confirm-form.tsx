'use client';

import { type FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '~/trpc/react';
import type { Locker } from '~/interfaces/Locker';
import { useRouter } from 'next/navigation';

const LockerOperatorConfirmSchema = z.object({
  height: z.coerce.number().positive(),
  width: z.coerce.number().positive(),
  depth: z.coerce.number().positive(),
});

type LockerOperatorConfirmValues = z.infer<typeof LockerOperatorConfirmSchema>;

type LockerOperatorConfirmFormProps = {
  password: string;
  locker: Locker;
  onSucess: (locker: Locker & { loaded: boolean; confirmedOperator: boolean }, password: string) => void;
};

const LockerOperatorConfirmForm: FunctionComponent<LockerOperatorConfirmFormProps> = ({ onSucess, password, locker }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting: _isSubmitting },
  } = useForm<LockerOperatorConfirmValues>({
    resolver: zodResolver(LockerOperatorConfirmSchema),
  });

  const { mutateAsync } = api.reservation.confirmOperator.useMutation();
  const { isLoading, mutateAsync: cancel } = api.reservation.cancel.useMutation();

  const isSubmitting = _isSubmitting || isLoading;

  const onSubmit = async ({ height, width, depth }: LockerOperatorConfirmValues) => {
    let locker: Locker | undefined = undefined;
    let expired = false;

    try {
      await toast.promise(mutateAsync({ password, height, width, depth }), {
        loading: 'Validando...',
        success: (data) => {
          if (data.expired) {
            expired = true;
            throw new Error('expired');
          }

          locker = data.locker;
          return '¡Validado!';
        },
        error: 'Hubo un error validando...',
      });
    } catch (err) {
      // Nothing
    }

    if (expired) {
      toast.error('No hay locker disponible');
      router.push('/');
    }

    if (locker) {
      onSucess(locker, password);
    }
  };

  const handleCancel = async () => {
    let canceled = false;

    try {
      await toast.promise(cancel({ password, type: 'operator' }), {
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
    <div className="space-y-4">
      <div className="border border-gray-100">
        <div className="bg-gray-100 px-4 py-2">
          <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
            Nombre Locker
          </label>
          <div className="mt-1">{locker.nickname}</div>
        </div>

        <div className="px-4 py-2">
          <label htmlFor="password" className="block text-sm font-bold leading-6 text-gray-900">
            Dimensiones Locker
          </label>
          <div className="mt-1">
            {locker.sizes.height}x{locker.sizes.width}x{locker.sizes.depth}
          </div>
        </div>
      </div>

      <p className="font-bold text-red-600">Si quieres rotar el paquete recuerda reflejar este cambio en los campos de abajo.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="height" className="block text-sm font-medium leading-6 text-gray-900">
            Alto
          </label>
          <div className="mt-2">
            <input
              {...register('height')}
              id="height"
              type="number"
              required
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="width" className="block text-sm font-medium leading-6 text-gray-900">
            Ancho
          </label>
          <div className="mt-2">
            <input
              {...register('width')}
              id="width"
              type="number"
              required
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="depth" className="block text-sm font-medium leading-6 text-gray-900">
            Fondo
          </label>
          <div className="mt-2">
            <input
              {...register('depth')}
              id="depth"
              type="number"
              required
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
            onClick={() => handleCancel()}
            disabled={isSubmitting}
          >
            Cancelar Reservar
          </button>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
            disabled={isSubmitting}
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );
};

export default LockerOperatorConfirmForm;
