"use client"
import { gatosMontoTotalDiario } from '@/app/lib/gasto';
import { cerrarCaja, checkAperturaCaja, getCajaInicial, pedidoMontoTotalDiario } from '@/app/lib/operaciones.api';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentDate } from "../../../../../lib/utils";

interface DecodedToken {
    userId: number;
    sucursal: string;
}

const CerrarCajaForm = () => {
    const [montoFinal, setMontoFinal] = useState(0); 
    const [gastosAdministrativos, setGastosAdministrativos] = useState(0);
    const [otrosIngresos, setOtrosIngresos] = useState(0);
    const [otrosEgresos, setOtrosEgresos] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const [tokenData, setTokenData] = useState<DecodedToken | null>(null);
    const [isRedirect, setIsRedirect] = useState(false);
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [registroDiario, setRegistroDiario] = useState('');
    const [ montoGastoSueldo, setGastoSueldos] = useState(0);
    const [ montoGastoFijo, setGastoFijo] = useState(0);
    const [ montoGastoVariable, setGastoVariable] = useState(0);
    const [ montoCajaInicial, setMontoCajaInicial] = useState(0);
    const [ingresosTotales, setIngresosTotales] = useState(0); 
    const router = useRouter();

    useEffect(() => {
        const verificarCaja = async () => {
          try {
            const res = await checkAperturaCaja(getCurrentDate());
            console.log(res)
            if (res.caja_abierta) {
              setCajaAbierta(true);
              setRegistroDiario(res.registro_diario_id)
            }
          } catch (error) {
            console.error('Error al verificar la caja:', error);
          }
        };
        
          
        verificarCaja();
        
      }, [router]);

      // Nuevo useEffect para cargar datos cuando registroDiario esté disponible
    useEffect(() => {
        if (registroDiario) {
            const obtenerMontoPedidos = async () => {
                try {
                    const montoPedidos = await pedidoMontoTotalDiario(registroDiario);
                    setMontoFinal(montoPedidos.sum);
                } catch (error) {
                    console.error("Error al obtener pedidos del día:", error);
                    setMontoFinal(0);
                } 
            };

            const obtenerMontoGastoSueldos = async () => {
                try { 
                    console.log("reg diario", registroDiario)
                    const monto = await gatosMontoTotalDiario(registroDiario, "sueldos");
                    const montoNumerico = parseFloat(monto);
                    console.log("monto su", montoNumerico);
                    if (!isNaN(montoNumerico)) {
                        setGastoSueldos(montoNumerico);
                    } else {
                        console.warn("El monto recibido no es un número válido:", monto);
                        setGastoSueldos(0);
                    }
                } catch (error) {
                    console.error("Error al obtener gastos de sueldo", error);
                    setGastoSueldos(0);
                }
            };

            const obtenerMontoGastoFijo = async () => {
                try { 
                    const monto = await gatosMontoTotalDiario(registroDiario, "fijo");
                    const montoNumerico = parseFloat(monto);
                    console.log("monto fijo", montoNumerico);
                    if (!isNaN(montoNumerico)) {
                        setGastoFijo(montoNumerico);
                    } else {
                        console.warn("El monto recibido no es un número válido:", monto);
                        setGastoFijo(0);
                    }
                } catch (error) {
                    console.error("Error al obtener gastos de fijo", error);
                    setGastoFijo(0);
                }
            };

            const obtenerMontoGastoVariable = async () => {
                try { 
                    const monto = await gatosMontoTotalDiario(registroDiario, "variable");
                    const montoNumerico = parseFloat(monto);
                    console.log("monto var", montoNumerico);
                    if (!isNaN(montoNumerico)) {
                        setGastoVariable(montoNumerico);
                    } else {
                        console.warn("El monto recibido no es un número válido:", monto);
                        setGastoVariable(0);
                    }
                } catch (error) {
                    console.error("Error al obtener gastos de variable", error);
                    setGastoVariable(0);
                }
            };

            const obtenerCajaInicial = async () => {
                const monto = await getCajaInicial(registroDiario)
                const montoNumerico = parseFloat(monto.sum) || 0;
                console.log("monto inicial", montoNumerico);
                if (!isNaN(montoNumerico)) {
                    setMontoCajaInicial(montoNumerico);
                } else {
                    console.warn("El monto recibido no es un número válido:", monto);
                    setMontoCajaInicial(0);
                }
            }

            // Ejecutar todas las funciones
            obtenerMontoPedidos();
            obtenerMontoGastoSueldos();
            obtenerMontoGastoFijo();
            obtenerMontoGastoVariable();
            obtenerCajaInicial();
        }
    }, [registroDiario]); // Este efecto se ejecuta cuando registroDiario cambia

    // Nuevo useEffect para calcular otrosEgresos cuando los gastos cambien
useEffect(() => {
    const totalEgresos = montoGastoVariable + montoGastoFijo + montoGastoSueldo;
    setOtrosEgresos(totalEgresos);
    const totalIngresos  = Number(montoCajaInicial) + Number(montoFinal);
    setIngresosTotales(totalIngresos)
}, [montoGastoVariable, montoGastoFijo, montoGastoSueldo,montoCajaInicial,montoFinal]); // Se ejecuta cuando cualquiera de estos valores cambia

    useEffect(() => {
        if (isRedirect) {
            router.replace('/dashboard/operaciones/empleado');
            router.refresh();
        }
    }, [isRedirect,router]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded: DecodedToken = jwtDecode(token);
            setTokenData(decoded);
        }
    }, [router]);

    useEffect(() => {
        const obtenerMontoPedidos = async () => {
            if (tokenData) {
                try {
                    const res = await getAperturaCaja();
                    if(res.caja_abierta === true){
                        const montoPedidos = await pedidoMontoTotalDiario(res.registro_diario_id);
                        setMontoFinal(montoPedidos.sum);
                    }
                } catch (error) {
                    console.error("Error al obtener pedidos del día:", error);
                    setMensaje('No se pudo calcular los pedidos del día. Intente más tarde.');
                }
            }

            async function getAperturaCaja() {
                const currentDate = new Date();
                const localISODate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}-${currentDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T${currentDate
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${currentDate
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}:${currentDate
                    .getSeconds()
                    .toString()
                    .padStart(2, '0')}`;
                const data = {
                    fecha: localISODate
                };
                const res = await checkAperturaCaja(data);
                return res;
            }
        };
        obtenerMontoPedidos();
    }, [tokenData,router]);

    // Función para manejar precisión decimal en el cálculo
    const calcularMontoFinal = () => {
        const ingresos = (Number(montoFinal) + Number(otrosIngresos) + Number(montoCajaInicial)).toFixed(2);
        const egresos = (Number(otrosEgresos) + Number(gastosAdministrativos)).toFixed(2);
        
        return (parseFloat(ingresos) - parseFloat(egresos)).toFixed(2);
    };
    
    const handleRedirect = () => {
        router.push('/dashboard/operaciones/empleado');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
           
            if (token) {
                const decoded: DecodedToken = jwtDecode(token);
          
                const data = {
                    //fecha: currentDate,
                    id: registroDiario,
                    monto_final: parseFloat(calcularMontoFinal()),
                    usuario_cierre_id: decoded.userId,
                    sucursal_id: decoded.sucursal,
                    detalles: {
                        gastos_administrativos: parseFloat(gastosAdministrativos.toFixed(2)),
                        otros_ingresos: parseFloat(otrosIngresos.toFixed(2)),
                        otros_egresos: parseFloat(otrosEgresos.toFixed(2)),
                    }
                };
           
                await cerrarCaja(data);
                setMensaje('Caja cerrada correctamente.');
                setIsRedirect(true);
            }
        } catch (error) {
            console.log(error);
            setMensaje('Error al cerrar la caja. Por favor, intente de nuevo.');
        }
    };

    return (
        <div>
        {cajaAbierta ? (
        <div className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-lg font-bold">Cerrar Caja</h2>
            {mensaje && <p className={`text-${mensaje.includes('Error') ? 'red' : 'green'}-500`}>{mensaje}</p>}
            
           
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Ingresos Totales :</label>
                    <input
                        type="number"
                        value={ingresosTotales}
                        className="w-full px-3 py-2 border rounded"
                        readOnly
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-gray-700">Egresos:</label>
                    <input
                        type="number"
                        value={otrosEgresos}
                        
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Monto Final Calculado:</label>
                    <input
                        type="number"
                        value={calcularMontoFinal()}
                        className="w-full px-3 py-2 border rounded"
                        readOnly
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-red-600"
                >
                    Cerrar Caja
                </button>
            </form> 
        </div>
    ) : (
        <div>
         <h2 className="text-lg font-bold">No se abrio caja aun</h2>
         <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleRedirect}
         >
            Ir a abrir Caja
        </button>
        </div> 
         
     )}  
    </div> 
    );
};

export default CerrarCajaForm;
