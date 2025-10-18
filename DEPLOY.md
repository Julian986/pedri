# 🚀 Guía de Deploy en Vercel

## Pasos para deployar tu aplicación

### 1. Preparar el repositorio

```bash
# Inicializar git (si no lo hiciste)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Configuración inicial de la app"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

### 2. Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 Sandbox - Gratis)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", permite acceso desde cualquier IP (0.0.0.0/0)
6. Click en "Connect" → "Connect your application"
7. Copia el connection string

**Ejemplo:**
```
mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/gestion-propiedades?retryWrites=true&w=majority
```

### 3. Deploy en Vercel

#### Opción A: Desde el sitio web

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate o inicia sesión (puedes usar tu cuenta de GitHub)
3. Click en "Add New..." → "Project"
4. Importa tu repositorio de GitHub
5. Configura las variables de entorno:
   - Click en "Environment Variables"
   - Agrega estas 3 variables:

```
MONGODB_URI = mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/...
JWT_SECRET = tu_clave_secreta_muy_segura_y_larga
NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
```

6. Click en "Deploy"
7. Espera 2-3 minutos
8. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

#### Opción B: Desde la CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_APP_URL

# Deploy a producción
vercel --prod
```

### 4. Actualizar la URL de la PWA

Una vez que tengas tu URL de Vercel, actualiza:

1. `NEXT_PUBLIC_APP_URL` en las variables de entorno de Vercel
2. Haz un nuevo deploy para aplicar los cambios

### 5. Probar la PWA

1. Abre tu app en el celular: `https://tu-app.vercel.app`
2. En Chrome Android: Menú → "Instalar app"
3. En Safari iOS: Compartir → "Añadir a pantalla de inicio"

### 6. Configurar dominio personalizado (opcional)

1. En Vercel, ve a tu proyecto → Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar el DNS

## 🔧 Variables de entorno necesarias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | Connection string de MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Clave secreta para JWT (mínimo 32 caracteres) | `mi_super_clave_secreta_12345...` |
| `NEXT_PUBLIC_APP_URL` | URL de tu aplicación | `https://tu-app.vercel.app` |

## 📱 Verificar que la PWA funcione

Después del deploy, verifica:

- [ ] La app se puede instalar en el celular
- [ ] El ícono de la app aparece correctamente
- [ ] La app funciona offline (al menos la página principal)
- [ ] Los colores del tema se aplican correctamente

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verifica que el MONGODB_URI esté configurado en Vercel
- Asegúrate de que MongoDB Atlas permita acceso desde 0.0.0.0/0

### La PWA no se puede instalar
- Verifica que estés usando HTTPS (Vercel lo da automáticamente)
- Revisa que los íconos estén en `/public/icon-*.png`
- Abre DevTools → Application → Manifest para ver errores

### Cambios no se reflejan
- Haz un nuevo commit y push a GitHub
- Vercel hará deploy automáticamente
- O fuerza un nuevo deploy desde el dashboard de Vercel

## 🔄 Actualizar la app

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de los cambios"
git push

# Vercel hará deploy automático
```

## 📚 Recursos adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [PWA Checklist](https://web.dev/pwa-checklist/)



