import Link from 'next/link';
import Image from 'next/image';

import SignInImage from '~/../public/sign-in.jpeg';
import Logo from '~/../public/logo.png';

export default function Home() {
  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="relative h-16 w-16 lg:block">
          <Image className="absolute inset-0 h-full w-full object-cover" src={Logo} alt="" />
        </div>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">Bienvenido a SACC Estaciones de Entrega</h2>
          </div>
          <div className="mt-10 flex space-x-4">
            <Link
              href="/operator"
              className="flex items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
            >
              Soy Operario
            </Link>

            <Link
              href="/client"
              className="flex items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
            >
              Soy Cliente
            </Link>
          </div>
        </div>
        <div className="mt-auto">
          <Link href="/sign-in" className="text-red-600 hover:text-red-700">
            Administración...
          </Link>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image className="absolute inset-0 h-full w-full object-cover" src={SignInImage} alt="" />
      </div>
    </div>
  );
}
