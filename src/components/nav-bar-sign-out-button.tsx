'use client';

import { type FunctionComponent } from 'react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

const NavBarSignOutButton: FunctionComponent = () => {
  const handleClick = async () => {
    await toast.promise(signOut({ redirect: true }), {
      loading: 'Cerrando Sesión...',
      success: '¡Sesión Cerrada!',
      error: 'Hubo un error Cerrando Sesión...',
    });
  };

  return (
    <button
      type="button"
      className="flex h-10 items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
      onClick={handleClick}
    >
      Cerrar Sesión
    </button>
  );
};

export default NavBarSignOutButton;
