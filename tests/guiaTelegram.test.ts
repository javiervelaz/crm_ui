import { describe, expect, it } from 'vitest';
import {
  MINUTOS_LINK_VINCULACION,
  PASOS_GUIA,
  pasosPendientes,
  PREGUNTAS_FRECUENTES,
} from '@/app/lib/guiaTelegram';

describe('guía del bot de Telegram', () => {
  it('el link de vinculación dura lo mismo que en el backend (600 s)', () => {
    expect(MINUTOS_LINK_VINCULACION).toBe(10);
    const texto = JSON.stringify([PASOS_GUIA, PREGUNTAS_FRECUENTES]);
    expect(texto).toContain('10 minutos');
  });

  it('el orden es el del flujo real: instalar → cuenta → BotFather → /newbot → nombre → usuario → token → conectar → vincular → equipo', () => {
    expect(PASOS_GUIA.map((p) => p.id)).toEqual([
      'instalar',
      'cuenta',
      'botfather',
      'iniciar',
      'nombre',
      'usuario',
      'token',
      'conectar',
      'vincular',
      'equipo',
    ]);
  });

  it('ids únicos y todos con título y detalle', () => {
    const ids = PASOS_GUIA.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PASOS_GUIA) {
      expect(p.titulo.length).toBeGreaterThan(3);
      expect(p.detalle.length).toBeGreaterThan(20);
    }
  });

  it('advierte que el token es secreto y cómo revocarlo', () => {
    const token = PASOS_GUIA.find((p) => p.id === 'token')!;
    expect(token.aviso).toMatch(/no lo compartas/i);
    expect(token.aviso).toContain('/revoke');
  });

  it('nunca incluye un token de ejemplo con formato válido (no se puede copiar uno real por error)', () => {
    const texto = JSON.stringify([PASOS_GUIA, PREGUNTAS_FRECUENTES]);
    expect(texto).not.toMatch(/\d{8,}:[A-Za-z0-9_-]{30,}/);
  });

  it('con el bot ya conectado quedan sólo los pasos de vincular y de equipo', () => {
    expect(pasosPendientes(true).map((p) => p.id)).toEqual([
      'vincular',
      'equipo',
    ]);
    expect(pasosPendientes(false)).toHaveLength(PASOS_GUIA.length);
  });

  it('cada problema común tiene respuesta', () => {
    expect(PREGUNTAS_FRECUENTES.length).toBeGreaterThanOrEqual(6);
    for (const f of PREGUNTAS_FRECUENTES)
      expect(f.respuesta.length).toBeGreaterThan(30);
  });
});

describe('GuiaBotTelegram (render)', () => {
  it('sin bot: abierta, con los 10 pasos, el link a BotFather y las FAQ', async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: Guia } = await import(
      '@/app/dashboard/canales/componentes/GuiaBotTelegram'
    );
    const html = renderToStaticMarkup(
      createElement(Guia, { tieneBot: false, mostrarConsultas: true }),
    );
    expect(html).toContain('https://t.me/BotFather');
    expect(html).toContain('/newbot');
    expect(html).toContain('/revoke');
    expect(html).toContain('¿cuánto vendí hoy?');
    expect(html.match(/<li class="flex gap-3">/g)).toHaveLength(10);
    expect(html).toContain('Preguntas frecuentes');
    expect(html).toContain('https://telegram.org/apps');
    expect(html).toContain('Vas a ver:');
  });

  it('con bot: cerrada (sólo el encabezado) y sin las consultas si no es gastronomía', async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: Guia } = await import(
      '@/app/dashboard/canales/componentes/GuiaBotTelegram'
    );
    const html = renderToStaticMarkup(createElement(Guia, { tieneBot: true }));
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('Preguntas frecuentes');
  });
});

describe('videos de la guía', () => {
  it('cada video y su poster declarados existen en public/ y pesan poco', async () => {
    const { existsSync, statSync } = await import('node:fs');
    const { VIDEOS_GUIA } = await import('@/app/lib/guiaTelegram');
    expect(VIDEOS_GUIA.length).toBeGreaterThan(0);
    for (const v of VIDEOS_GUIA) {
      for (const ruta of [v.src, v.poster]) {
        expect(ruta.startsWith('/assets/guias/')).toBe(true);
        const archivo = `public${ruta}`;
        expect(existsSync(archivo), archivo).toBe(true);
        expect(statSync(archivo).size).toBeLessThan(3 * 1024 * 1024);
      }
    }
  });

  it('sin bot el render muestra el video con su poster antes de los pasos; con bot no', async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: Guia } = await import(
      '@/app/dashboard/canales/componentes/GuiaBotTelegram'
    );
    const sin = renderToStaticMarkup(createElement(Guia, { tieneBot: false }));
    expect(sin).toContain('/assets/guias/guia-telegram-crear-bot.mp4');
    expect(sin).toContain('poster="/assets/guias/guia-telegram-crear-bot.jpg"');
    expect(sin.indexOf('<video')).toBeLessThan(sin.indexOf('<ol'));
    // la guía abre cerrada con bot, pero aun abierta no repetiría el video de creación
    const con = renderToStaticMarkup(createElement(Guia, { tieneBot: true }));
    expect(con).not.toContain('<video');
  });

  it('el formulario del token va dentro del paso "Pegalo en Counter", no al final de la guía', async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: Guia } = await import(
      '@/app/dashboard/canales/componentes/GuiaBotTelegram'
    );
    const form = createElement('input', { id: 'campo-token' });
    const html = renderToStaticMarkup(
      createElement(Guia, { tieneBot: false, formularioToken: form }),
    );
    expect(html.match(/id="campo-token"/g)).toHaveLength(1);
    const i = html.indexOf('id="campo-token"');
    expect(i).toBeGreaterThan(html.indexOf('Pegalo en Counter'));
    expect(i).toBeLessThan(html.indexOf('Vinculá tu propio Telegram'));
    expect(i).toBeLessThan(html.indexOf('Preguntas frecuentes'));
  });
});
