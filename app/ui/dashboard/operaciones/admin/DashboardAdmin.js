import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    ventas: 15000,
    inventario: 5000,
    costos: 3000,
  });

  // Simulación de llamada a la API con datos mockeados
  useEffect(() => {
    const fetchMockStats = () => {
      // Simulación de un retraso en la "llamada API"
      setTimeout(() => {
        const mockData = {
          ventas: 20000,
          inventario: 8000,
          costos: 4000,
        };
        setStats(mockData);
      }, 1000);
    };

    fetchMockStats();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Estadísticas del Negocio</h2>
      <Bar
        data={{
          labels: ['Ventas', 'Inventario', 'Costos'],
          datasets: [
            {
              label: 'Datos',
              data: [stats.ventas, stats.inventario, stats.costos],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        }}
        options={{
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default DashboardAdmin;
