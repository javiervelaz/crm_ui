'use client';

import { useEffect, useState } from 'react';
import { checkAperturaCaja } from '../lib/operaciones.api';
import { getCurrentDate } from '../lib/utils';

const useCajaAbierta = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [registroDiarioId, setRegistroDiarioId] = useState(null);
  const [fechaApertura, setFechaApertura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarCaja = async () => {
      try {
        const fechaActual = getCurrentDate();
        const res = await checkAperturaCaja(getCurrentDate());
        if (res.caja_abierta) {
          setCajaAbierta(true);
          setRegistroDiarioId(res.registro_diario_id);
          setFechaApertura(res.fecha);
        } else {
          setCajaAbierta(false);
        }
      } catch (error) {
        console.error('Error al verificar apertura de caja:', error);
        setCajaAbierta(false);
      } finally {
        setLoading(false);
      }
    };

    verificarCaja();
  }, []);

  return {
    cajaAbierta,
    registroDiarioId,
    fechaApertura,
    loading,
  };
};

export default useCajaAbierta;
