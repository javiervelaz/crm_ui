import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Servicio de notificaciones
export const notifySuccess = (message: string) => {
  toast.success(message, {
    position: 'top-center',  // Actualizado
    autoClose: 5000,
  });
};

export const notifyError = (message: string) => {
  toast.error(message, {
    position: 'top-center',  // Actualizado
    autoClose: 5000,
  });
};
