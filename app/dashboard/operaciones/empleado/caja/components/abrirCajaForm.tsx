"use client"
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
            if (typeof onClose === 'function') {
              onClose();  // Verifica si onClose es una función antes de llamarla
              setTimeout(() => {
                window.location.href = '/dashboard/operaciones/empleado';
                window.location.reload();
              }, 500);
             
            } else {
              console.error('onClose no es una función');
            }
           
          }
          
        } catch (error) {
          console.log(error);
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
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Abrir Caja
            </button>
          </form>
        </div>
      );
  };
  
  export default AbrirCajaForm;
  