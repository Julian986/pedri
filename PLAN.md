### Plan de trabajo - Backend y Análisis

- Alcance: completar API para las 5 páginas (Inicio, Calendario, Reservas, Gastos, Análisis), exportaciones CSV, validaciones, seguridad y despliegue.

### Pasos y estado
1) Modelado de datos Mongoose [hecho]
   - Propiedad (sin duenoId, colorUI opcional), Reserva (estado incluye 'bloqueo', índices por fechas), Pago (sin duenoId, moneda requerida, índices), Gasto (con nota opcional, índice por propiedad/fecha).

2) Endpoints CRUD base [hecho]
   - Propiedades: listado/detalle/alta/edición/soft delete.
   - Reservas: listado con intersección de rangos, verificación anti-solapamiento, detalle/edición/cancelación.
   - Pagos: listado con filtros (reservaId, propiedadId, estado, from/to por fechaPago), alta con comisiones calculadas, edición.
   - Gastos: listado con filtros (propiedadId, categoría, from/to), alta, detalle, edición, eliminación.

3) Exportaciones CSV [hecho]
   - GET /api/export/reservas|gastos|pagos con filtros comunes; content-type text/csv.

4) Endpoints de análisis [hecho]
   - Origen: reservas por origen con intersección de [fechaInicio, fechaFin), excluye canceladas/bloqueo.
   - Gastos por categoría: {categoria,total}.
   - Ganancia por propiedad: comisiones – gastos.
   - Detalle por propiedad: ingresos, comisiones, propietarios, gastos, ganancia, margen.

5) Integración frontend (pendiente)
   - Análisis: sustituir datos demo por llamadas reales a endpoints (from/to, propiedadId).
   - Gastos: usar CRUD y mostrar nota en tarjetas (ok), conectar a backend.
   - Reservas: añadir filtro por propiedad (UI), usar rango de fechas y refresco de calendario tras crear/cancelar.
   - Inicio/Calendario: leer KPIs y ocupación a partir de endpoints existentes (o crear específicos si hace falta).

6) Validaciones y reglas (pendiente)
   - Anti-solapamiento de reservas en server (ya aplicado en creación).
   - Reglas de estados: excluir 'cancelada' de ocupación/ingresos; 'bloqueo' ocupa calendario.
   - Pagos: moneda requerida; fechaPago autogenerada al marcar como pagado.

7) Índices de MongoDB (revisar en Atlas) (pendiente)
   - Reserva: {propiedadId,fechaInicio}, {propiedadId,fechaFin}, compuesto de disponibilidad.
   - Gasto: {propiedadId,fecha:-1}.
   - Pago: {reservaId,fechaPago:-1}, {propiedadId,fechaPago:-1}.
   - Confirmar creación/estado de índices y tiempos de consulta en colecciones con datos reales.

8) Seguridad de API (pendiente)
   - `requireAuth` ya activo en rutas de escritura y análisis; extender a lo necesario.
   - Añadir `robots.txt` + `X‑Robots‑Tag: noindex` y, opcional, Basic Auth temporal para previsualizaciones.
   - En prod: bloquear acceso por host `*.vercel.app` en `middleware` (permitir solo dominio propio).

9) Variables de entorno (pendiente)
   - MONGODB_URI, JWT_SECRET, ALLOW_REGISTER=false, PREVIEW_PASSWORD (opcional), NODE_ENV.

10) Cloudflare Zero Trust + WARP (post-backend) (pendiente)
   - Comprar dominio y apuntar a Vercel via Cloudflare (proxy naranja).
   - Crear org Zero Trust, inscribir dispositivos de Pedro (WARP), Access app `https://app.tudominio.com` con política Allow (WARP+email) y Block por defecto.

11) Pruebas (pendiente)
   - Seeds/datos de prueba, colección de requests (REST Client o Postman).
   - E2E básicos: crear reserva → ver en calendario; pagos y saldo; gastos y análisis por período; exportaciones CSV.

12) Observabilidad (opcional) (pendiente)
   - Manejo de errores y logs; integración con Sentry o similar si se requiere.

13) Despliegue (pendiente)
   - Configurar envs en Vercel, verificar build y tiempo de respuesta de agregaciones.
   - Validar protección con Cloudflare en prod y bloqueo de rutas directas.


