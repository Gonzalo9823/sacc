'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FunctionComponent } from 'react';

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const NavbarOptions: FunctionComponent = () => {
  const pathName = usePathname();

  return (
    <div className="-my-px ml-6 flex space-x-8">
      <Link
        href="/stations"
        className={classNames(
          pathName?.includes('stations')
            ? 'border-red-600 text-gray-900'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
        )}
      >
        Estaciones
      </Link>

      <Link
        href="/users"
        className={classNames(
          pathName?.includes('users') ? 'border-red-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
        )}
      >
        Usuarios
      </Link>
    </div>
  );
};

export default NavbarOptions;
