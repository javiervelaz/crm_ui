/**
 * Logger de la app.
 *
 * Regla: nunca escribir console.* directamente en componentes ni en la capa de API.
 * En producción estos helpers no emiten nada, así que ningún payload con datos de
 * usuarios, roles o pedidos llega a la consola del navegador del cliente.
 */
const isDev = process.env.NODE_ENV !== 'production';

export const log = (...args: unknown[]): void => {
  if (isDev) console.log(...args);
};

export const logWarn = (...args: unknown[]): void => {
  if (isDev) logWarn(...args);
};

/**
 * Errores. En producción queda como punto único donde enchufar
 * Sentry / LogRocket / lo que se elija más adelante.
 */
export const logError = (message: string, error?: unknown): void => {
  if (isDev) {
    logError(message, error);
    return;
  }
  // TODO(fase 1.3): reportar a servicio de monitoreo.
};
