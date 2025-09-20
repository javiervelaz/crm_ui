"use client";


import { lusitana } from '@/app/ui/fonts';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import styles from './page.module.css';

const ComerciosPage = () => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); // Redirige al login si no hay token
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('https://comercios.vercel.app/search', {
      //const response = await axios.post('http://localhost:3001/search', {
        query: search,
        city: city,
        radius: 5000
      },{ headers: { 'x-access-token': token } 
    });
      setMessage('Data successfully saved and exported to Google Sheets');
    } catch (error) {
      setMessage('An error occurred');
      console.error(error);
    }
  };

  return (
    <div className={`${styles.container} ${lusitana.className}`}>
      <h1>Buscar comercios</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label htmlFor="search">Buscar comercio por rubro.:</label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="city">Ciudad:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Exportar</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default ComerciosPage;
