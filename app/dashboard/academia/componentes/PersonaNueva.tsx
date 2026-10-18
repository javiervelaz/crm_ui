'use client';

import type { Acceso } from '@/app/lib/edu/edu.api';
import type { EntidadPersona } from '@/app/lib/edu/reglas';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import CredencialesDialog from './CredencialesDialog';
import PersonaForm from './PersonaForm';
import { nombreCompleto, TEXTOS } from './personas';
import { Encabezado, Tarjeta } from './ui';

export default function PersonaNueva({ entidad }: { entidad: EntidadPersona }) {
  const t = TEXTOS[entidad];
  const router = useRouter();
  const params = useSearchParams();
  const tutorId = Number(params.get('tutor_id')) || undefined;
  const [creado, setCreado] = useState<{
    id: number;
    nombre: string;
    acceso: Acceso;
  } | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <Encabezado titulo={t.nuevo} volver={{ href: t.base, label: t.plural }} />
      <Tarjeta>
        <PersonaForm
          entidad={entidad}
          prefijados={
            entidad === 'alumnos' && tutorId ? { tutor_id: tutorId } : undefined
          }
          onCancelar={() => router.push(t.base)}
          onGuardado={(p, acceso) => {
            if (acceso)
              setCreado({ id: p.id, nombre: nombreCompleto(p), acceso });
            else router.push(`${t.base}/${p.id}`);
          }}
        />
      </Tarjeta>
      {creado && (
        <CredencialesDialog
          acceso={creado.acceso}
          nombre={creado.nombre}
          onClose={() => router.push(`${t.base}/${creado.id}`)}
        />
      )}
    </div>
  );
}
