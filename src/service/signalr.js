import * as signalR from '@aspnet/signalr'

let connection = null

export function getConnection() {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:44394/chatHub')
      .configureLogging(signalR.LogLevel.Information)
      .build()

    // Reconexión automática si se pierde la conexión
    connection.onclose(async () => {
      console.warn('Conexión perdida, reconectando...')
      await startConnection()
    })
  }
  return connection
}

export async function startConnection() {
  const conn = getConnection()
  try {
    await conn.start()
    console.log('✅ SignalR conectado')
  } catch (err) {
    console.error('❌ Error al conectar:', err)
    setTimeout(startConnection, 5000) // reintenta cada 5s
  }
}