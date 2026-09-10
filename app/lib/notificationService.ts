import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Servicio de notificaciones
const baseOpts = {
  position: 'top-right' as const,
  autoClose: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
};

export const notifySuccess = (message: string) => {
  toast.success(message, baseOpts);
};

export const notifyError = (message: string) => {
  // errores un poco más largos para poder leerlos
  toast.error(message, { ...baseOpts, autoClose: 4500 });
};
