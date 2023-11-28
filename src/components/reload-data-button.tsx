'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type FunctionComponent } from 'react';

const ReloadDataButton: FunctionComponent = () => {
  const router = useRouter();

  useEffect(() => {
    const onFocus = () => {
      router.refresh();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [router]);

  return (
    <button
      type="button"
      className="flex h-10 items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
      onClick={() => router.refresh()}
    >
      Re Cargar
    </button>
  );
};

export default ReloadDataButton;
