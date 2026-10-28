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
  /** Qué tiene que ver la persona en pantalla al hacer el paso (para confirmar que va bien). */
  veras?: string;
  /** Botón de enlace externo. */
  enlace?: { texto: string; href: string };
  /** 'conectar' = pasos que se hacen en Telegram y se cierran al conectar el bot. */
  fase: 'telegram' | 'counter' | 'equipo';
}

export interface PreguntaGuia {
  pregunta: string;
  respuesta: string;
}

export const PASOS_GUIA: PasoGuia[] = [
  {
    id: 'instalar',
    fase: 'telegram',
    titulo: 'Instalá Telegram',
    detalle:
      'Telegram es una app de mensajes, como WhatsApp, y es gratis. Descargala en tu celular desde la tienda de aplicaciones (Play Store en Android, App Store en iPhone) o usala desde la compu sin instalar nada. Si ya la tenés, pasá al paso 3.',
    enlace: { texto: 'Descargar Telegram', href: 'https://telegram.org/apps' },
  },
  {
    id: 'cuenta',
    fase: 'telegram',
    titulo: 'Creá tu cuenta',
    detalle:
      'Abrí la app, tocá “Empezar” e ingresá tu número de celular. Telegram te manda un código de 5 números (por SMS o dentro de la misma app): escribilo y listo. Después te pide tu nombre; poné el que quieras.',
    veras:
      'Una pantalla con tu lista de chats, vacía o con algún mensaje de bienvenida de Telegram.',
  },
  {
    id: 'botfather',
    fase: 'telegram',
    titulo: 'Buscá a BotFather',
    detalle:
      'BotFather es el bot oficial de Telegram para crear bots. Tocá la lupa de arriba, escribí BotFather y elegí el que tiene una tilde azul al lado del nombre (es el verdadero; hay imitadores sin tilde). O tocá el botón de abajo, que lo abre directo.',
    enlace: { texto: 'Abrir @BotFather', href: 'https://t.me/BotFather' },
    veras: 'Un chat con “BotFather” y un botón “Iniciar” (o “Start”) abajo.',
  },
  {
    id: 'iniciar',
    fase: 'telegram',
    titulo: 'Tocá “Iniciar” y pedile un bot nuevo',
    codigo: '/newbot',
    detalle:
      'Tocá “Iniciar” (Start). BotFather te manda una lista de comandos. Después escribí /newbot en el espacio para mensajes y envialo, como si le mandaras un WhatsApp.',
    veras:
      'BotFather responde: “Alright, a new bot. How are we going to call it?”. Está en inglés, es normal.',
  },
  {
    id: 'nombre',
    fase: 'telegram',
    titulo: 'Elegí el nombre del bot',
    detalle:
      'Escribí el nombre que van a ver tus clientes, con espacios y mayúsculas si querés. Por ejemplo, el nombre de tu comercio: “Pizzería Don José”. Lo podés cambiar después.',
    veras: 'BotFather pregunta por el “username” del bot.',
  },
  {
    id: 'usuario',
    fase: 'telegram',
    titulo: 'Elegí el usuario del bot',
    detalle:
      'Es como una dirección única: sin espacios ni tildes y tiene que terminar en “bot”. Por ejemplo, pizzeriadonjose_bot. Si ya está usado, BotFather te avisa y probás con otro (por ejemplo agregando tu ciudad).',
    veras:
      'Un mensaje que empieza con “Done! Congratulations on your new bot” y tiene una línea larga con números, dos puntos y letras: ese es el token.',
  },
  {
    id: 'token',
    fase: 'telegram',
    titulo: 'Copiá el token',
    detalle:
      'El token es la línea larga de ese mensaje (algo como 123456789:AAH…, con los dos puntos en el medio). En el celular: mantené apretado el token hasta que se marque y tocá “Copiar”. En la compu: tocá el token una vez y se copia solo, o seleccionalo con el mouse y apretá Ctrl+C. Tiene que quedar completo, sin espacios.',
    aviso:
      'El token es la llave del bot: quien lo tenga puede controlarlo. No lo compartas con nadie ni lo pegues en otro lado que no sea esta pantalla. Si se filtra, escribile /revoke a BotFather para generar uno nuevo.',
  },
  {
    id: 'conectar',
    fase: 'counter',
    titulo: 'Pegalo en Counter y conectá',
    detalle:
      'Volvé a esta pantalla, pegá el token en el campo de abajo (en el celular, mantené apretado el campo y tocá “Pegar”; en la compu, Ctrl+V) y tocá “Conectar bot”. Counter deja el bot listo solo: no tenés que configurar nada más en Telegram.',
    veras: 'Arriba aparece “Conectado” con el nombre de tu bot.',
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
      'Cada persona que quiera usar el bot (cajeros, encargados) necesita tener Telegram (pasos 1 y 2), entrar a Counter con su propio usuario, tocar el ícono de Telegram arriba a la derecha y repetir el paso anterior. Lo que ve cada uno depende de los permisos de su usuario, no del bot.',
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
    pregunta: 'No me llega el código de Telegram',
    respuesta:
      'Esperá un minuto y revisá los SMS. Si ya tenías Telegram en otro dispositivo, el código llega como mensaje dentro de esa app, en el chat “Telegram”. Si no llega, tocá “Enviar el código por llamada” o volvé a pedirlo.',
  },
  {
    pregunta: 'No encuentro a BotFather en el buscador',
    respuesta:
      'Escribí BotFather todo junto y buscá el que tiene la tilde azul. Si no aparece, usá el botón “Abrir @BotFather” de esta guía, que lo abre directo.',
  },
  {
    pregunta: 'BotFather me contesta en inglés',
    respuesta:
      'Es normal: Telegram no lo traduce. Lo único que tenés que hacer es responderle lo que te pregunta (el nombre y después el usuario) y copiar el token del mensaje final.',
  },
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

export interface VideoGuia {
  id: string;
  titulo: string;
  descripcion: string;
  src: string;
  poster: string;
}

/**
 * Videos de la guía (en public/assets/guias). Antes de publicar uno: recortar
 * la ventana a la conversación y difuminar tokens, links con credenciales y
 * chats privados. Pendiente: grabación de la creación del bot con BotFather.
 */
export const VIDEOS_GUIA: VideoGuia[] = [];
