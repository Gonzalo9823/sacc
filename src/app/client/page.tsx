import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import Image from 'next/image';
import Link from 'next/link';

import './styles.css';
import SignInForm from '~/app/_components/sign-in-form';
import SignInImage from '~/../public/sign-in.jpeg';
import StationLogo from '~/../public/station_logo.png';

export default async function Operator() {

  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="logo-container lg:block">
      <Link href='/' passHref>
        <Image
          className="logo-image"
          src={StationLogo}
          alt=""
        />
        </Link>
      </div>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">Ingresa tu Contraseña</h2>
          </div>
          <div>
            <p>Revisa tu correo y en SPAM</p>
          </div>
        <form action="">
        <div>
        <label htmlFor="password" className="pass-title">
          Contraseña
        </label>
        <div className="mt-2">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className='pass-input'
          />
        </div>
      </div>
        </form>
        <Link href="/client/info" passHref className='mt-2'>
        <button className="button">
          Ingresar
        </button>
        </Link>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image className="absolute inset-0 h-full w-full object-cover" src={SignInImage} alt="" />
      </div>
    </div>
  );
}
