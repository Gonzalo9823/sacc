'use client';
import React from 'react';
// import { api } from '~/trpc/server';


import { getServerAuthSession } from '~/server/auth';

export default async function SignIn() {
  const session = await getServerAuthSession();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const handleSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const data = {
      email: email,
      password: password
    }
    // log in with router create in auth.js

    const token = api.auth.login(data)

    if (token) {
      // save token in local storage
      localStorage.setItem('token', token)
    }
    else {
      setError('Invalid email or password')
    }
  }

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
           
      <div>
           <form >
      <label>
        Email:
        <input type="text" value={email} onChange={handleEmailChange} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={handlePasswordChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
    </div>



    </main>
  );
}
