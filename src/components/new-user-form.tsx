'use client';

import { type FunctionComponent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { Switch } from '@headlessui/react';

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const NewUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  enabled: z.boolean(),
  role: z.nativeEnum(UserRole),
});

type NewUserValues = z.infer<typeof NewUserSchema>;

const NewUserForm: FunctionComponent = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = useForm<NewUserValues>({
    resolver: zodResolver(NewUserSchema),
  });

  const { mutateAsync } = api.user.create.useMutation();

  const onSubmit = async (values: NewUserValues) => {
    let added = false;

    try {
      await toast.promise(mutateAsync(values), {
        loading: 'Creando...',
        success: () => {
          added = true;
          return '¡Creado!';
        },
        error: 'Hubo un error creando el usuario...',
      });
    } catch (err) {
      // Nothing
    }

    if (added) {
      router.push('/users');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
          Nombre
        </label>
        <div className="mt-2">
          <input
            {...register('name')}
            id="name"
            type="text"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
          Mail
        </label>
        <div className="mt-2">
          <input
            {...register('email')}
            id="email"
            type="email"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
          Contraseña
        </label>
        <div className="mt-2">
          <input
            {...register('password')}
            id="password"
            type="password"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="enabled" className="block text-sm font-medium leading-6 text-gray-900">
          ¿Activo?
        </label>
        <div className="mt-2">
          <Controller
            control={control}
            name="enabled"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                className={classNames(
                  field.value ? 'bg-red-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:bg-gray-100'
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    field.value ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            )}
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
          Rol
        </label>
        <div className="mt-2">
          <select
            {...register('role')}
            id="role"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
            disabled={isSubmitting}
          >
            <option value=""></option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.USER}>Usuario</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="flex w-fit items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
          disabled={isSubmitting}
        >
          Crear
        </button>
      </div>
    </form>
  );
};

export default NewUserForm;
