'use client';

import { type FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const LockerUnlockSchema = z.object({
  password: z.string().trim().min(1),
});

type LockerUnlockValues = z.infer<typeof LockerUnlockSchema>;

type LockerUnlockFormProps = {
  type: 'client' | 'operator';
  onSucess: () => void;
};

const LockerUnlockForm: FunctionComponent<LockerUnlockFormProps> = ({ onSucess }) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LockerUnlockValues>({
    resolver: zodResolver(LockerUnlockSchema),
  });

  const onSubmit = async (_values: LockerUnlockValues) => {
    let validated = false;

    await toast.promise(new Promise((f) => setTimeout(f, 2000)), {
      loading: 'Validando...',
      success: () => {
        validated = true;
        return '¡Validado!';
      },
      error: 'Hubo un error validando...',
    });

    if (validated) {
      onSucess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
          Contraseña
        </label>
        <div className="mt-2">
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
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
          Buscar
        </button>
      </div>
    </form>
  );
};

export default LockerUnlockForm;
