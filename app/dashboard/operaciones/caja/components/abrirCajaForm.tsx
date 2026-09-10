"use client"
import { logError } from '@/app/lib/logger';
import { getClienteId } from "@/app/lib/authService";
import { abrirCaja } from '@/app/lib/operaciones.api';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DecodedToken {
    userId: string;
    sucursalId: string;
  }

  interface AbrirCajaFormProps {
    onClose: () => void;
  }
const AbrirCajaForm = ({onClose}:AbrirCajaFormProps) => {
    
    const [montoInicial, setMontoInicial] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tokenData, setTokenData] = useState({});
    const router = useRouter();
    const [isRedirect, setIsRedirect] = useState(false);

    useEffect(() => {
      if (isRedirect) {
        router.replace('/dashboard/operaciones/empleado');
        router.refresh();
      }
    }, [isRedirect,router]);
  
   

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMensaje('');
        // bug 34: validar monto inicial (requerido, no negativo)
        const montoNum = parseFloat(montoInicial);
        if (montoInicial === '' || Number.isNaN(montoNum)) {
          setMensaje('Ingresá el monto inicial de caja.');
          return;
        }
        if (montoNum < 0) {
          setMensaje('El monto inicial no puede ser negativo.');
          return;
        }
        try {
          const client_id = getClienteId();
          const token = localStorage.getItem('token');
          if(token) {
            const decoded = jwtDecode<DecodedToken>(token);
            var currentDate = new Date();
            const data = {
              fecha: currentDate,
              usuario_apertura_id: decoded.userId,
              caja_inicial: parseFloat(montoInicial),
              sucursal_id: 1,
              cliente_id: client_id
            };
           
            await abrirCaja(data);
            // bug 22: refrescar el estado de caja sin recargar la página
            window.dispatchEvent(new Event('caja-changed'));
            if (typeof onClose === 'function') {
              onClose();
            } else {
              logError('onClose no es una función');
            }
           
          }
          
        } catch (error: any) {
          setMensaje(error?.message || 'No se pudo abrir la caja.');
        }
      };
  
    return (
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-bold">Abrir Caja</h2>
          {mensaje && <p className="text-red-500">{mensaje}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Monto Inicial:</label>
              <input
                type="text"
                inputMode="decimal"
                value={montoInicial}
                onChange={(e) => {
                  // bug 36: normalizar -> solo dígitos y un punto, sin ceros a la izquierda
                  let v = e.target.value.replace(/[^\d.]/g, '');
                  const parts = v.split('.');
                  v = parts.shift() + (parts.length ? '.' + parts.join('') : '');
                  v = v.replace(/^0+(?=\d)/, '');
                  setMontoInicial(v);
                }}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-600"
            >
              Abrir Caja
            </button>
          </form>
        </div>
      );
  };
  
  export default AbrirCajaForm;
  