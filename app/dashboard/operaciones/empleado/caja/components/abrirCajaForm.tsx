"use client"
import { logError } from '@/app/lib/logger';
import { getClienteId } from "@/app/lib/authService";
import { abrirCaja } from '@/app/lib/operaciones.api';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentDate } from "@/app/lib/utils";

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
            var currentDate = getCurrentDate().fecha;
            const data = {
              fecha: currentDate,
              usuario_apertura_id: decoded.userId,
              caja_inicial: parseFloat(montoInicial),
              sucursal_id: 1,
              cliente_id: client_id
            };
           
            await abrirCaja(data);
            if (typeof onClose === 'function') {
              onClose();  // Verifica si onClose es una función antes de llamarla
              setTimeout(() => {
                window.location.href = '/dashboard/operaciones/empleado';
                window.location.reload();
              }, 500);
             
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
                type="number"
                min="0"
                step="0.01"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
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
  