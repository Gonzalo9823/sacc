import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';
import Link from 'next/link';

import './styles.css';
import SignInForm from '~/app/_components/sign-in-form';
import SignInImage from '~/../public/sign-in.jpeg';
import StationLogo from '~/../public/station_logo.png';

export default async function Home() {
  const session = await getServerAuthSession();
  if (session) redirect('/stations');

  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="logo-container lg:block">
        <Link href='/operator' passHref>
        <Image
          className="logo-image"
          src={StationLogo}
          alt=""
        />
        </Link>
      </div>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">Ingresa el PAQUETE</h2>
          </div>
          <div>
            <h2 className='pass-subtitle'>
              El casillero es:
            </h2>
            <h1 className='pass-title'>Aca dato casillero</h1>
          </div>
        </div>
        <Link href="/" passHref className='mt-2'>
        <button className="button-signin">
          Cerrar Sesion
        </button>
        </Link>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image className="absolute inset-0 h-full w-full object-cover" src={SignInImage} alt="" />
      </div>
    </div>
  );
}
