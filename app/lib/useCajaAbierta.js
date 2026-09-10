'use client';

import { useEffect, useState } from 'react';
import { checkAperturaCaja } from '../lib/operaciones.api';
import { getCurrentDate } from '../lib/utils';
import { getClienteId } from './authService';

const useCajaAbierta = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [registroDiarioId, setRegistroDiarioId] = useState(null);
  const [fechaApertura, setFechaApertura] = useState(null);
  const [loading, setLoading] = useState(true);

  const verificarCaja = async () => {
    try {
      const data = { cliente_id: getClienteId() };
      const res = await checkAperturaCaja(data);
      if (res.caja_abierta) {
        setCajaAbierta(true);
        setRegistroDiarioId(res.registro_diario_id);
        setFechaApertura(res.fecha);
      } else {
        setCajaAbierta(false);
        setRegistroDiarioId(null);
      }
    } catch (error) {
      console.error('Error al verificar apertura de caja:', error);
      setCajaAbierta(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verificarCaja();
    // bug 22: refrescar el estado de caja sin recargar la página cuando se abre/cierra
    const handler = () => verificarCaja();
    window.addEventListener('caja-changed', handler);
    return () => window.removeEventListener('caja-changed', handler);
  }, []);

  return {
    cajaAbierta,
    registroDiarioId,
    fechaApertura,
    loading,
    refetch: verificarCaja,
  };
};

export default useCajaAbierta;
