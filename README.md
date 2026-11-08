# wa-bot

Chatbot de WhatsApp para un negocio de alquiler de casas. Conversa con los clientes usando **Dialogflow**, los identifica y registra en **Google Sheets**, y avisa a un administrador por WhatsApp cuando hay un cliente nuevo o un pedido.

Construido con Node.js, [`venom-bot`](https://github.com/orkestral/venom) (control de WhatsApp Web), Dialogflow y Google Sheets.

## Qué hace

- Recibe mensajes de WhatsApp (ignora los grupos) y, cuando el cliente escribe **"Hola"**, busca su número en la hoja `Clientes`.
  - Si existe, inicia Dialogflow con el contexto `cliente_existe`.
  - Si no existe, usa el contexto `cliente_nuevo` y lo guía para registrarse.
- Envía cada mensaje a Dialogflow con una sesión propia por número y devuelve las respuestas por WhatsApp.
- Según el intent y los contextos que devuelva Dialogflow:
  - `ver_catalogo`: envía el enlace al catálogo de WhatsApp Business.
  - `ver_opciones`: envía botones (*Ver Ofertas*, *Hacer un Pedido*, *Hablar a un Asesor*).
  - Intent `3.NuevoCliente.SI`: guarda al cliente en la hoja `Clientes`, avisa al administrador y le envía el contacto.
  - Intent `6.Pedido`: guarda el pedido en la hoja `Datos de ventas` con estado `NUEVO PEDIDO` (casa, fecha, días, personas, comentarios) y avisa al administrador.
- Responde a las llamadas indicando que es un robot y que escriba *Hola*.
- Detecta conflictos de sesión y desconexiones de WhatsApp e intenta recuperarse.
- Expone un servidor HTTP mínimo: `GET /` devuelve el estado de la conexión de WhatsApp.

## Arquitectura

```
WhatsApp  <->  venom-bot (wapp.js)  <->  Dialogflow (dialogflow.js)
                     |
                     +--> Google Sheets (spreadsheet.js)
                     |
              Express (index.js)  -> GET /  (estado del bot)
```

| Archivo | Función |
|---|---|
| `index.js` | Punto de entrada: inicia el bot y el servidor Express. |
| `wapp.js` | Lógica principal: mensajes, sesiones, envío de respuestas, botones, avisos al administrador. |
| `dialogflow.js` | Cliente de Dialogflow (`detectIntent` con contexto y parámetros). |
| `spreadsheet.js` | Lee y agrega filas con `google-spreadsheet` (la versión en uso). |
| `googlesheet.js` | Alternativa con `googleapis` (incluye `setVenta`). No la importa ningún otro archivo. |
| `tokens/` | Datos de sesión de WhatsApp generados por `venom-bot`. |

## Requisitos

- Node.js y npm.
- Google Chrome instalado (el bot usa `useChrome: true`).
- Un agente de Dialogflow con los intents y contextos mencionados arriba.
- Una cuenta de servicio de Google con acceso al proyecto de Dialogflow y a la hoja de cálculo.
- Una hoja de Google Sheets con las pestañas `Clientes` (columnas: Telefono, Nombre, Apellido, Ciudad) y `Datos de ventas`.
- Un número de WhatsApp para el bot.

## Instalación

```bash
git clone https://github.com/pedr0cruz/wa-bot.git
cd wa-bot
npm install
```

## Configuración

Los archivos de configuración y credenciales **no se incluyen en el repositorio**. Debes crearlos tú:

1. **`.env`** en la raíz:

   ```env
   PORT=80
   IP=127.0.0.1
   ```

2. **`config/config.js`**, que debe exportar los datos de Dialogflow:

   ```js
   module.exports = {
     GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
     GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
     GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
     DF_LANGUAGE_CODE: 'es',
   };
   ```

   Ajusta el código de idioma al de tu agente de Dialogflow.

3. **`config/gscredentials.json`**: la clave JSON de la cuenta de servicio de Google. Comparte la hoja de cálculo con el correo de esa cuenta.

4. En `wapp.js` y `spreadsheet.js`, reemplaza los valores fijos por los tuyos: número del administrador, número del bot, enlace del catálogo, ID de la hoja de cálculo y `gid` de la pestaña `Clientes`.

> **Nunca subas** `.env`, `config/`, `tokens/` ni claves a un repositorio público. Si alguna ya se subió, revócala y genera una nueva.

## Uso

```bash
node index.js
```

La primera vez, `venom-bot` abre WhatsApp Web en Chrome y debes escanear el código QR con el teléfono. La sesión queda guardada en `tokens/`, así que no hará falta repetirlo en los siguientes arranques.

Para comprobar que está activo, abre `http://127.0.0.1:<PORT>/` y verás el estado de la conexión.

## Dependencias principales

`venom-bot`, `dialogflow`, `pb-util`, `google-spreadsheet`, `googleapis`, `express`, `dotenv`, `uuid`.

## Limitaciones conocidas

- Las sesiones de conversación viven en memoria: se pierden al reiniciar el proceso.
- El nombre del intent y los parámetros esperados (`CasaFecha`, `CasaDias`, `CasaCantidad`, `CasaComentario`, `CasaCodigo`) están acoplados al agente de Dialogflow.
- Un error no controlado en el manejo de un mensaje cierra el cliente de WhatsApp.
- `package.json` aún no tiene un script `start`.

## Licencia

Sin licencia definida (`package.json` indica ISC).
