import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '~/server/auth';
import NavBarSignOutButton from '~/components/nav-bar-sign-out-button';
import NavBarHeader from '~/components/nav-bar-header';

export default async function LoggedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  if (!session) redirect('/');

  return (
    <section>
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex flex-shrink-0 items-center">
              <Link className="font-bold" href="/stations">
                Locker Hub
              </Link>
            </div>
            <div className="flex items-center">
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
