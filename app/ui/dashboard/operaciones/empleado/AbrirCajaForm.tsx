import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

interface DecodedToken {
    userId: string;
    role: string;
  }
const AbrirCajaForm = () => {
    const [montoInicial, setMontoInicial] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const [tokenData, setTokenData] = useState({});
    
    useEffect(() => {
        // Obtener el token desde el localStorage (o cualquier otro lugar donde se almacene)
        const token = localStorage.getItem('token');
        if (token) {
          // Decodificar el token para extraer usuario_id y sucursal_id
          const decodedToken: DecodedToken = jwtDecode(token);
          setTokenData({
            usuario_id: decoded.usuario_id,
            sucursal_id: decoded.sucursal_id
          });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
          var currentDate = new Date();
          const data = {
            fecha: currentDate,
            usuario_apertura: tokenData.usuario_id,
            caja_inicial: parseFloat(montoInicial),
            sucursal: tokenData.sucursal_id
          };
          console.log(data)
          //await abrirCaja(cajaData);
          
          //router.push('/dashboard/usuarios');
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
  