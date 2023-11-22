import React from 'react'
import { logIn } from '../../../server/api/routers/auth.ts'
import style from './style.css'

export default function UserSignIn (props) {

  // Create a User Sign in page

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const data = {
      email: email,
      password: password
    }
    // log in with router create in auth.js

    cons token = await logIn(data)

    if (token) {
      // save token in local storage
      localStorage.setItem('token', token)
      // redirect to home page
      props.history.push('/')
    }
  }



  return (
    <div className={style.container}>UserSignIn
    
    <form onSubmit={handleSubmit}>
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
  )
}
