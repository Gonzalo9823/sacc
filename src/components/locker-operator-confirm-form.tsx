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
  onSucess: (locker: Locker & { loaded: boolean; confirmedOperator: boolean }, password: string) => void;
};

const LockerOperatorConfirmForm: FunctionComponent<LockerOperatorConfirmFormProps> = ({ onSucess, password }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LockerOperatorConfirmValues>({
    resolver: zodResolver(LockerOperatorConfirmSchema),
  });

  const { mutateAsync } = api.reservation.confirmOperator.useMutation();

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

  return (
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

      <div>
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
          disabled={isSubmitting}
        >
          Confirmar
        </button>
      </div>
    </form>
  );
};

export default LockerOperatorConfirmForm;