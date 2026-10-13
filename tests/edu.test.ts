import { describe, expect, it } from 'vitest';
import {
  admiteAccesoPropio,
  armarAgenda,
  edad,
  errorDeApi,
  erroresHorarios,
  esMenor,
  lineasConflicto,
  nombreMes,
  validarPersona,
  type TurnoAgenda,
} from '@/app/lib/edu/reglas';
import {
  canAccess,
  landingForToken,
  menuModules,
  RUTA_CAMBIO_PASSWORD,
  sessionModules,
} from '@/app/lib/modules';
import { passwordValida } from '@/app/lib/passwordPolicy';

const REF = '2026-10-13';
const ACADEMIA = ['usuarios', 'roles', 'plan', 'gasto', 'flujo', 'alumnos'];

describe('sesión y menú de la academia', () => {
  it('el admin de la academia ve Academia, Gastos y Flujo', () => {
    expect(menuModules(ACADEMIA).map((m) => m.key)).toEqual([
      'alumnos',
      'gasto',
      'flujo',
    ]);
    expect(canAccess('/dashboard/academia/inscripciones/12', ACADEMIA)).toBe(
      true,
    );
  });

  it('profesor, tutor y alumno: sólo "Mis clases", aunque el token traiga módulos', () => {
    for (const tipo of ['PROF', 'TUT', 'ALU']) {
      const mods = sessionModules({ tipo, modules: ['alumnos'] });
      expect(mods).toEqual(['mis-clases']);
      expect(canAccess('/dashboard/academia/alumnos', mods)).toBe(false);
      expect(landingForToken({ tipo, role: ['profesor'] })).toBe(
        '/dashboard/mis-clases',
      );
    }
  });

  it('contraseña temporal: siempre a la pantalla de cambio', () => {
    expect(landingForToken({ tipo: 'TUT', debeCambiarPassword: true })).toBe(
      RUTA_CAMBIO_PASSWORD,
    );
    expect(
      landingForToken({
        role: ['admin'],
        modules: ACADEMIA,
        debeCambiarPassword: true,
      }),
    ).toBe(RUTA_CAMBIO_PASSWORD);
  });

  it('cambiar la contraseña está abierto para cualquiera', () => {
    expect(canAccess(RUTA_CAMBIO_PASSWORD, [])).toBe(true);
  });

  it('staff de gastronomía no cambia', () => {
    expect(
      landingForToken({ role: ['admin'], modules: ['operaciones', 'gasto'] }),
    ).toBe('/dashboard/operaciones/admin');
  });
});

describe('alumno: edad y tutor', () => {
  it('edad exacta al día', () => {
    expect(edad('2008-10-14', REF)).toBe(17);
    expect(edad('2008-10-13', REF)).toBe(18);
    expect(esMenor('2008-10-14', REF)).toBe(true);
    expect(edad('2026-02-30', REF)).toBe(null);
  });

  it('el formulario exige tutor si es menor de 18', () => {
    const base = { nombre: 'Tomás', apellido: 'Ruiz', telefono: '', email: '' };
    expect(
      validarPersona(
        'alumnos',
        { ...base, fecha_nacimiento: '2015-05-10', tutor_id: '' },
        REF,
      ).tutor_id,
    ).toMatch(/tutor/);
    expect(
      validarPersona(
        'alumnos',
        { ...base, fecha_nacimiento: '2015-05-10', tutor_id: 3 },
        REF,
      ),
    ).toEqual({});
    expect(
      validarPersona(
        'alumnos',
        { ...base, fecha_nacimiento: '1995-05-10', tutor_id: '' },
        REF,
      ),
    ).toEqual({});
  });

  it('acceso propio sólo para mayores sin tutor, y con email', () => {
    expect(
      admiteAccesoPropio(
        'alumnos',
        { fecha_nacimiento: '2015-05-10', tutor_id: 3 },
        REF,
      ),
    ).toBe(false);
    expect(
      admiteAccesoPropio(
        'alumnos',
        { fecha_nacimiento: '1995-05-10', tutor_id: 3 },
        REF,
      ),
    ).toBe(false);
    expect(
      admiteAccesoPropio(
        'alumnos',
        { fecha_nacimiento: '1995-05-10', tutor_id: '' },
        REF,
      ),
    ).toBe(true);
    expect(admiteAccesoPropio('profesores', {}, REF)).toBe(true);
    const e = validarPersona(
      'profesores',
      {
        nombre: 'Laura',
        apellido: 'Gómez',
        telefono: '',
        email: '',
        crear_acceso: true,
      },
      REF,
    );
    expect(e.email).toMatch(/email/);
  });

  it('el tutor necesita teléfono', () => {
    expect(
      validarPersona(
        'tutores',
        { nombre: 'Pedro', apellido: 'Ruiz', telefono: '', email: '' },
        REF,
      ).telefono,
    ).toBeTruthy();
  });
});

describe('horarios', () => {
  it('detecta rango inválido, faltantes y turnos que se pisan', () => {
    expect(erroresHorarios([]).general).toBeTruthy();
    const r = erroresHorarios([
      { dia_semana: 1, hora_inicio: '18:00', hora_fin: '19:00' },
      { dia_semana: 1, hora_inicio: '18:30', hora_fin: '19:30' },
      { dia_semana: 2, hora_inicio: '10:00', hora_fin: '10:00' },
      { dia_semana: 3, hora_inicio: '', hora_fin: '11:00' },
      { dia_semana: 1, hora_inicio: '19:00', hora_fin: '20:00' },
    ]);
    expect(r.porFila[0]).toBeUndefined();
    expect(r.porFila[1]).toMatch(/horario 1/);
    expect(r.porFila[2]).toMatch(/posterior/);
    expect(r.porFila[3]).toMatch(/horas/);
    expect(r.porFila[4]).toMatch(/horario 2/); // pisa al 2 (18:30-19:30)
  });

  it('turnos contiguos son válidos', () => {
    expect(
      erroresHorarios([
        { dia_semana: 1, hora_inicio: '18:00', hora_fin: '19:00' },
        { dia_semana: 1, hora_inicio: '19:00', hora_fin: '20:00' },
      ]).porFila,
    ).toEqual({});
  });
});

describe('errores de la API', () => {
  it('el 409 de superposición se muestra con el detalle', () => {
    const err = {
      response: {
        data: {
          error:
            'El profesor ya tiene clase el día 1 de 18:00 a 19:00 (Julia Díaz, Guitarra)',
          code: 'HORARIO_SUPERPUESTO',
          field: 'horarios',
          detalle: [
            {
              motivo: 'PROFESOR_OCUPADO',
              horario: {
                dia_semana: 1,
                hora_inicio: '18:30',
                hora_fin: '19:30',
              },
              alumno: 'Julia Díaz',
              clase: 'Guitarra',
              hora_inicio: '18:00',
              hora_fin: '19:00',
            },
          ],
        },
      },
    };
    const e = errorDeApi(err);
    expect(e.code).toBe('HORARIO_SUPERPUESTO');
    expect(e.mensaje).toMatch(/Julia Díaz/);
    expect(lineasConflicto(e)[0]).toBe(
      'Lunes 18:30–19:30: el profesor ya tiene a Julia Díaz en Guitarra (18:00–19:00)',
    );
  });

  it('cupo completo y alumno ocupado', () => {
    const e = errorDeApi({
      response: {
        data: {
          code: 'CUPO_COMPLETO',
          detalle: [
            {
              motivo: 'CUPO_COMPLETO',
              horario: {
                dia_semana: 3,
                hora_inicio: '17:00',
                hora_fin: '18:00',
              },
            },
            {
              motivo: 'ALUMNO_OCUPADO',
              horario: {
                dia_semana: 3,
                hora_inicio: '17:00',
                hora_fin: '18:00',
              },
              clase: 'Piano',
              hora_inicio: '17:00',
              hora_fin: '18:00',
            },
          ],
        },
      },
    });
    expect(lineasConflicto(e)).toEqual([
      'Miércoles 17:00–18:00: el taller tiene el cupo completo',
      'Miércoles 17:00–18:00: el alumno ya tiene Piano (17:00–18:00)',
    ]);
  });

  it('sin respuesta de la API usa el mensaje por defecto', () => {
    expect(errorDeApi(new Error('Network'), 'No se pudo').mensaje).toBe(
      'No se pudo',
    );
  });
});

describe('agenda semanal', () => {
  const t = (over: Partial<TurnoAgenda>): TurnoAgenda => ({
    dia_semana: 1,
    hora_inicio: '18:00',
    hora_fin: '19:00',
    inscripcion_id: 1,
    profesor_id: 1,
    profesor: 'Laura',
    alumno: 'Julia',
    clase: 'Guitarra',
    es_grupal: false,
    ...over,
  });

  it('un taller con varios alumnos en el mismo turno es un bloque', () => {
    const { bloques } = armarAgenda([
      t({
        inscripcion_id: 1,
        clase: 'Ensamble',
        es_grupal: true,
        dia_semana: 3,
        hora_inicio: '17:00',
        hora_fin: '18:00',
        alumno: 'Sofía',
      }),
      t({
        inscripcion_id: 2,
        clase: 'Ensamble',
        es_grupal: true,
        dia_semana: 3,
        hora_inicio: '17:00',
        hora_fin: '18:00',
        alumno: 'Julia',
      }),
      t({ inscripcion_id: 3 }),
    ]);
    expect(bloques).toHaveLength(2);
    expect(bloques[1].alumnos).toEqual(['Sofía', 'Julia']);
  });

  it('rango visible redondeado a la hora y sábado sólo si hay clases', () => {
    const a = armarAgenda([
      t({ hora_inicio: '09:30', hora_fin: '10:15' }),
      t({ inscripcion_id: 2, hora_inicio: '18:00', hora_fin: '19:00' }),
    ]);
    expect([a.desde, a.hasta]).toEqual([9 * 60, 19 * 60]);
    expect(a.dias).toEqual([1, 2, 3, 4, 5]);
    expect(a.bloques[0].top).toBe(30);
    expect(armarAgenda([t({ dia_semana: 6 })]).dias).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });
});

describe('varios', () => {
  it('política de contraseña igual a la API', () => {
    expect(passwordValida('GuitarraAzul2026')).toBe(true);
    expect(passwordValida('corta1A')).toBe(false);
    expect(passwordValida('sinmayusculas123')).toBe(false);
  });

  it('nombre de mes', () => {
    expect(nombreMes('2026-12-01')).toBe('diciembre 2026');
  });
});
