'use client';

// Link público de pedidos: app.countercrm.com/p/{slug}
// Pide una sesión del micrositio para el comercio dueño del slug y redirige
// al catálogo. El token queda en sessionStorage (catalogConfig), igual que el
// que llega por el bot.
import { iniciarSesionPorLink } from '@/app/catalogo/handoffApi';
import { storeHandoffToken } from '@/app/catalogo/catalogConfig';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LinkPublicoPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const r = await iniciarSesionPorLink(params.slug);
      if (cancelado) return;
      if (!r.ok) {
        setError(r.message);
        return;
      }
      storeHandoffToken(r.token);
      router.replace('/catalogo');
    })();
    return () => {
      cancelado = true;
    };
  }, [params.slug, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="max-w-md rounded-xl border border-brand-200 bg-white p-6 text-center shadow-card">
        {error ? (
          <>
            <h1 className="mb-2 text-lg font-semibold text-brand-800">
              Link no disponible
            </h1>
            <p className="text-sm text-brand-300">{error}</p>
          </>
        ) : (
          <p className="text-sm text-brand-700">Abriendo el catálogo…</p>
        )}
      </div>
    </div>
  );
}
