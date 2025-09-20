"use client";

import { lusitana } from '@/app/ui/fonts';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Cambia 'next/router' por 'next/navigation'
import { FormEvent, useState } from 'react';
import styles from './page.module.css';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      //const response = await axios.post('https://comercios.vercel.app/login', { email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard/orders'); // Redirige a tu pantalla de búsqueda o dashboard
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={`${styles.container} ${lusitana.className}`}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
      <div className={styles['form-group']}>
        <input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div> 
      <div className={styles['form-group']}>
      <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

        <button type="submit" className={styles.button}>Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
