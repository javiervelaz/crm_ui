'use client';

import useAuthCheck from '@/app/lib/useAuthCheck';
import Link from 'next/link';

const UpgradePlanPage = () => {
 

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          Funcionalidad no disponible en tu plan
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          La sección a la que intentaste acceder está incluida solo en un plan superior
          (por ejemplo, el plan <span className="font-semibold">Premium</span>).
        </p>

        <p className="mt-3 text-sm text-gray-600">
          Podés seguir usando todas las funciones incluidas en tu plan actual o mejorar
          el plan para desbloquear reportes, micrositio avanzado y bot de pedidos por
          WhatsApp.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <button className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Volver al inicio
            </button>
          </Link>

          <Link href="/saas">
            <button className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Ver planes y mejorar
            </button>
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Si ya cambiaste tu plan recientemente y seguís viendo este mensaje, probá
          cerrar sesión y volver a ingresar.
        </p>
      </div>
    </div>
  );
};

export default UpgradePlanPage;
