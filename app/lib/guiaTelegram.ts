/**
 * Contenido de la guía "crear tu bot de Telegram y vincularlo a Counter".
 * Es dato (no JSX) para poder testear que lo que se le explica al cliente
 * coincide con lo que hace el sistema (formato del token, vigencia del link…).
 */

/** Vigencia del link de vinculación: VINCULACION_TTL_SEGUNDOS en crm_api/services/canales. */
export const MINUTOS_LINK_VINCULACION = 10;

export interface PasoGuia {
  id: string;
  titulo: string;
  /** Texto del paso; `{{codigo}}` y `{{link}}` los resuelve el componente. */
  detalle: string;
  /** Comando o ejemplo para copiar. */
  codigo?: string;
  /** Aviso destacado (seguridad). */
  aviso?: string;
  /** 'conectar' = pasos que se hacen en Telegram y se cierran al conectar el bot. */
  fase: 'telegram' | 'counter' | 'equipo';
}

export interface PreguntaGuia {
  pregunta: string;
  respuesta: string;
}

export const PASOS_GUIA: PasoGuia[] = [
  {
    id: 'botfather',
    fase: 'telegram',
    titulo: 'Abrí @BotFather en Telegram',
    detalle:
      'BotFather es el bot oficial de Telegram para crear bots. Buscalo como @BotFather (tiene la tilde azul de verificado) o abrí el link de abajo desde tu celular o la versión web.',
  },
  {
    id: 'newbot',
    fase: 'telegram',
    titulo: 'Creá el bot con /newbot',
    codigo: '/newbot',
    detalle:
      'BotFather te pregunta dos cosas. Primero el nombre, que ven tus clientes (ej. “Pizzería Don José”). Después el usuario, que tiene que ser único, sin espacios y terminar en “bot” (ej. pizzeriadonjose_bot).',
  },
  {
    id: 'token',
    fase: 'telegram',
    titulo: 'Copiá el token',
    detalle:
      'Al terminar, BotFather te manda un mensaje con el token: una línea larga con dos puntos en el medio, parecida a 123456789:AAH… Copiala entera, sin espacios.',
    aviso:
      'El token es la llave del bot: quien lo tenga puede controlarlo. No lo compartas ni lo pegues en otro lado que no sea esta pantalla. Si se filtra, mandá /revoke a BotFather para generar uno nuevo.',
  },
  {
    id: 'conectar',
    fase: 'counter',
    titulo: 'Pegalo en Counter y conectá',
    detalle:
      'Pegá el token en el campo de abajo y tocá “Conectar bot”. Counter deja el bot listo solo: no tenés que configurar nada más en Telegram.',
  },
  {
    id: 'vincular',
    fase: 'counter',
    titulo: 'Vinculá tu propio Telegram',
    detalle: `Con el bot conectado, tocá “Vincular mi Telegram”. Se abre Telegram con tu bot: tocá “Iniciar” (Start). El link vale ${MINUTOS_LINK_VINCULACION} minutos; si vence, generá otro. Cuando el bot te salude por tu nombre, quedó vinculado.`,
  },
  {
    id: 'equipo',
    fase: 'equipo',
    titulo: 'Sumá a tu equipo',
    detalle:
      'Cada persona que quiera usar el bot (cajeros, encargados) entra a Counter con su propio usuario, toca el ícono de Telegram arriba a la derecha y repite el paso anterior. Lo que ve cada uno depende de los permisos de su usuario, no del bot.',
  },
];

/** Qué hace el bot una vez conectado y vinculado. */
export const QUE_HACE_EL_BOT = {
  clientes:
    'Si un cliente le escribe al bot, le contesta con el botón “Hacer mi pedido” que lo lleva a tu catálogo.',
  equipo:
    'Las personas vinculadas reciben un aviso por cada pedido nuevo (si su usuario tiene acceso a Pedidos y los avisos están prendidos).',
  consultas:
    'En comercios de gastronomía, además, podés escribirle preguntas como “¿cuánto vendí hoy?” o “¿en qué gasté esta semana?”. Te contesta según los permisos de tu usuario.',
};

export const PREGUNTAS_FRECUENTES: PreguntaGuia[] = [
  {
    pregunta: 'BotFather dice que el usuario ya está en uso',
    respuesta:
      'Los usuarios de Telegram son únicos. Probá otro que termine en “bot”, por ejemplo agregando tu barrio o tu ciudad (pizzeriadonjose_cba_bot).',
  },
  {
    pregunta: 'Counter dice que eso no parece un token',
    respuesta:
      'Copiá el mensaje de BotFather completo desde el primer número hasta el final, incluyendo los dos puntos y sin espacios al principio ni al final. Si dudás, mandá /mybots a BotFather, elegí tu bot y tocá “API Token”.',
  },
  {
    pregunta: 'Dice que ese bot ya está conectado a otro comercio',
    respuesta:
      'Cada bot atiende a un solo comercio. Creá uno nuevo con /newbot y usá ese token.',
  },
  {
    pregunta: 'El bot no me contesta',
    respuesta:
      'Revisá que arriba figure “Conectado” con el nombre de tu bot. Si no figura, conectalo de nuevo con el token. Si sigue sin responder, desconectalo y volvelo a conectar.',
  },
  {
    pregunta: 'El link de vinculación dice que venció o ya se usó',
    respuesta: `El link es de un solo uso y vale ${MINUTOS_LINK_VINCULACION} minutos. Volvé a tocar “Vincular mi Telegram” para generar uno nuevo y abrilo enseguida.`,
  },
  {
    pregunta: 'No me llegan los avisos de pedidos',
    respuesta:
      'Tu usuario necesita tener acceso al módulo Pedidos (operaciones) y los avisos prendidos en tu vinculación. Si no ves el acceso, pedíselo a quien administra Counter en tu comercio.',
  },
  {
    pregunta: 'Quiero cambiar el bot por otro',
    respuesta:
      'Desconectá el actual (al final de esta sección) y conectá el nuevo con su token. Cada persona del equipo tiene que volver a vincularse al bot nuevo.',
  },
];

/** Los pasos que ya no hace falta mostrar abiertos: todo lo que se hace antes de conectar. */
export const pasosPendientes = (tieneBot: boolean): PasoGuia[] =>
  tieneBot
    ? PASOS_GUIA.filter((p) => p.fase !== 'telegram' && p.id !== 'conectar')
    : PASOS_GUIA;
