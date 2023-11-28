import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';


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
        <Image
          className="logo-image"
          src={StationLogo}
          alt=""
        />
      </div>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">Bienvenido a SACC Estaciones de Entrega</h2>
          </div>
          <div className="mt-10">
          <Link href="/operator" passHref>
            <button className="button">
              Soy Operario
            </button>
          </Link>
          <Link href="/client" passHref>
            <button className="button">
              Soy Cliente
            </button>
          </Link>
          </div>
        </div>
      <div className="mt-auto">
        <Link href="/signIn" passHref>
          <button className='button-signin'>Sign In for Admins</button>
        </Link>
      </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image className="absolute inset-0 h-full w-full object-cover" src={SignInImage} alt="" />
      </div>
    </div>
  );
}
