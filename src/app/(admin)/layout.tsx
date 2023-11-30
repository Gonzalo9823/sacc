import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import NavBarSignOutButton from '~/components/nav-bar-sign-out-button';
import NavBarHeader from '~/components/nav-bar-header';
import NavbarOptions from '~/components/nav-bar-options';

export default async function LoggedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  return (
    <section>
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link className="font-bold" href="/stations">
                  Locker Hub
                </Link>
              </div>
              <NavbarOptions />
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex h-10 items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:bg-gray-100"
              >
                Pagina Principal
              </Link>
              <NavBarSignOutButton />
            </div>
          </div>
        </div>
      </nav>
      <div className="space-y-5 py-10">
        <NavBarHeader />
        <main>
          <div className="mx-auto sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </section>
  );
}
