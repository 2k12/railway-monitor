# 🚄 Railway Discord Monitor Bot

Un bot de Discord futurista para monitorear tus despliegues en Railway.

## 🚀 Características

- **Notificaciones en tiempo real**: Avisos visuales (Embeds) cuando un despliegue inicia, falla o tiene éxito.
- **Estética Cyberpunk**: Colores neón y diseño minimalista.
- **Comandos Pro**:
  - `/status`: Estado vital de tu proyecto (CPU, RAM, Servicios).
  - `/logs`: Historial reciente de despliegues.

## 🛠️ Configuración

### 1. Variables de Entorno (.env)

Configura estas variables en Railway:

\`\`\` bash
DISCORD_TOKEN= # Tu token de bot de Discord Developer Portal
RAILWAY_API_TOKEN= # Tu token de Railway (Project Settings -> Tokens)
CHANNEL_ID= # ID del canal de Discord donde llegarán las notificaciones
PORT=3000 # Puerto del servidor (Railway lo asigna automáticamente)
NODE_ENV=production
\`\`\`

### 2. Webhook Setup

1. Despliega este bot en Railway.
2. Obtén la URL pública (ej. `https://mi-bot.up.railway.app`).
3. Ve al proyecto que quieres monitorear en Railway.
4. **Settings -> Webhooks**.
5. Crea un nuevo webhook apuntando a: `https://TU-URL.up.railway.app/webhooks/railway`.

## 📦 Comandos Locales

- `npm run dev`: Inicia el bot en modo desarrollo.
- `npm run build`: Compila TypeScript.
- `npm start`: Inicia el bot en producción.
