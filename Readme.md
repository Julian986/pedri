
Pedri

Backend - next js serverless functions como API Routes, MongoDB, Mongoose

- Ultilizaremos Cloudflare WARP para que solo los dispositivos de pe puedan acceder
Cuando compres el dominio, activamos Cloudflare (proxy naranja), Zero Trust + WARP y bloqueamos el acceso directo al *.vercel.app.

MONGODB_URI="mongodb+srv://USUARIO:PASS@CLUSTER/pedri?retryWrites=true&w=majority&appName=CLUSTER"

Tasks:   
- Mejorar la ux de los formularios

- que lleve al wpp correspondiente✅ 
- total del form de inicio✅ 

Ideas:
- ¿Querés que agregue en la UI botones de “Exportar CSV” en Reservas y Gastos, y un filtro por rango de fechas simple (from/to) para que puedas probar los exports directo desde la app?

A considerar:
- El filtro por mes/año de la pagina de analisis, debe afectar toda la pagina.

Conexion Mongo:
Mientras sigas sin APIs listas, dejala en true. El día que actives el backend remoto la cambiamos a false y listo.