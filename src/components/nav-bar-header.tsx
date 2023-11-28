'use client';

import { usePathname } from 'next/navigation';
import { useState, type FunctionComponent, useEffect } from 'react';

const NavBarHeader: FunctionComponent = () => {
  const currentPathName = usePathname();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const titleElement = document.querySelector('title');

    if (titleElement?.textContent) {
      setPageTitle(titleElement.textContent);
    }
  }, [currentPathName]);

  if (!pageTitle) return null;

  return (
    <header>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">{pageTitle}</h1>
      </div>
    </header>
  );
};

export default NavBarHeader;
