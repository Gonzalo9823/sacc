import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';

import SignInForm from '~/components/sign-in-form';
import SignInImage from '~/../public/sign-in.jpeg';

export default async function SignIn() {
  const session = await getServerAuthSession();
  if (session) redirect('/stations');

  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">Iniciar Sesión</h2>
          </div>
          <div className="mt-10">
            <div>
              <SignInForm />
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image className="absolute inset-0 h-full w-full object-cover" src={SignInImage} alt="" />
      </div>
    </div>
  );
}
