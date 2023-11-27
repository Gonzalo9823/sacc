'use client';

import { type FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type SignInValues = z.infer<typeof SignInSchema>;

const SignInForm: FunctionComponent = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async ({ email, password }: SignInValues) => {
    let logged = false;

    await toast.promise(signIn('credentials', { email, password, redirect: false }), {
      loading: 'Iniciando Sesión...',
      success: (data) => {
        if (data?.status !== 200) throw new Error('');
        logged = true;
        return '¡Sesión Iniciada!';
      },
      error: 'Hubo un error Iniciando Sesión...',
    });

    if (logged) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
          Mail
        </label>
        <div className="mt-2">
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
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
            autoComplete="current-password"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 sm:text-sm sm:leading-6"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-100"
          disabled={isSubmitting}
        >
          Iniciar Sesión
        </button>
      </div>
    </form>
  );
};

export default SignInForm;
