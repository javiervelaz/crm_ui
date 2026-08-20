"use client";

import axios from 'axios';
import { useRouter } from 'next/navigation'; // Cambia 'next/router' por 'next/navigation'
import { FormEvent, useState } from 'react';
import styles from './page.module.css';
import VerificacionPendiente from '@/components/ui/VerificacionPendiente';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [noVerificado, setNoVerificado] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNoVerificado(false);

    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard/orders');
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;

      // 403 EMAIL_NO_VERIFICADO: la contraseña está bien, falta activar la
      // cuenta. Mostrar "credenciales inválidas" acá manda al usuario a
      // resetear una contraseña que funciona perfecto.
      if (status === 403 && code === 'EMAIL_NO_VERIFICADO') {
        setNoVerificado(true);
        return;
      }

      if (status === 403) {
        setError(err?.response?.data?.error || 'Tu cuenta no está disponible.');
        return;
      }

      setError('Email o contraseña incorrectos');
    }
  };

  if (noVerificado) {
    return (
      <div className={`${styles.container} font-display`}>
        <VerificacionPendiente email={email} conAvisoBloqueo />
        <button
          type="button"
          onClick={() => setNoVerificado(false)}
          className="mt-6 text-sm underline"
        >
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.container} font-display`}>
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
