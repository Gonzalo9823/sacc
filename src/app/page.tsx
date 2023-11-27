// Create root component
// Path: src/app/page.tsx
// Compare this snippet from src/app/signIn/page.tsx:
'use client';
import Link from 'next/link';
import React from 'react';



import { getServerAuthSession } from '~/server/auth';



export default async function Home() {
    const session = await getServerAuthSession();
    
    if (session) {
        return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
         {/* <UserSignIn />  */}
        </main>
        );
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
         {/* <UserSignIn /> */}

            <Link href="/signUp">
                Sign Up
            </Link>
        </main>
    );
}
