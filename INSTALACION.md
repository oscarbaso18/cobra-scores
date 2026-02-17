# 🐍 GUÍA DE INSTALACIÓN - COBRA SCORES

## 📁 Estructura del Proyecto

```
cobra-scores/
├── backend/              ← Servidor Node.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   └── README.md
│
└── frontend/            ← Página web
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

---

## 🚀 INSTALACIÓN PASO A PASO

### PASO 1: Crear la estructura de carpetas

Abre una terminal (CMD en Windows o Terminal en Mac/Linux) y ejecuta:

```bash
# Crear carpeta principal
mkdir cobra-scores
cd cobra-scores

# Crear carpeta del backend
mkdir backend
cd backend
```

### PASO 2: Configurar el Backend

#### 2.1 Copiar archivos del backend
Copia estos archivos a la carpeta `backend/`:
- `server.js`
- `package.json`
- `.env`
- `.gitignore`

#### 2.2 Instalar dependencias
En la terminal, estando en la carpeta `backend/`, ejecuta:

```bash
npm install
```

Esto instalará:
- ✅ express (servidor web)
- ✅ cors (manejo de peticiones entre dominios)
- ✅ dotenv (variables de entorno)
- ✅ nodemon (auto-reload en desarrollo)

#### 2.3 Verificar la API Key
Abre el archivo `.env` y verifica que tu API Key esté ahí:

```
FOOTBALL_API_KEY=XXXXXXXXXXXXX
PORT=3000
```

#### 2.4 Iniciar el servidor backend

```bash
npm start
```

Deberías ver:
```
🐍 Cobra Scores Backend corriendo en http://localhost:3000
📊 API Key configurada: ✅ Sí
```

**¡IMPORTANTE!** Deja esta terminal abierta con el servidor corriendo.

---

### PASO 3: Configurar el Frontend

#### 3.1 Crear estructura del frontend
Abre OTRA terminal (deja la anterior con el backend corriendo) y ejecuta:

```bash
# Volver a la carpeta principal
cd ..

# Crear estructura del frontend
mkdir frontend
cd frontend
mkdir css
mkdir js
```

#### 3.2 Copiar archivos del frontend
Copia estos archivos a sus respectivas carpetas:
- `index.html` → en `frontend/`
- `style.css` → en `frontend/css/`
- `main.js` → en `frontend/js/`

#### 3.3 Abrir el frontend
Tienes dos opciones:

**Opción A: Con Live Server (Recomendado)**
1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

**Opción B: Directamente en el navegador**
1. Navega a la carpeta `frontend/`
2. Doble clic en `index.html`
3. Se abrirá en tu navegador predeterminado

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### 1. Backend funcionando
Ve a: http://localhost:3000

Deberías ver:
```json
{
  "message": "🐍 Cobra Scores API está funcionando!",
  "endpoints": [...]
}
```

### 2. Frontend funcionando
El frontend debería estar abierto en tu navegador.
- Debería cargar partidos de la Premier League automáticamente
- Puedes cambiar de liga en el selector
- Puedes navegar entre Resultados, Calendario y Clasificaciones

### 3. Probar conexión backend-frontend
Si ves partidos en pantalla, ¡todo está funcionando! 🎉

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module 'express'"
**Solución:**
```bash
cd backend
npm install
```

### Error: "Port 3000 already in use"
**Solución:**
Edita el archivo `.env` y cambia:
```
PORT=3001
```

Luego actualiza `main.js` en el frontend:
```javascript
const API_URL = 'http://localhost:3001/api';
```

### Error: "Failed to fetch" en el navegador
**Causas posibles:**
1. El backend no está corriendo → Inicia con `npm start`
2. Puerto incorrecto → Verifica que sea 3000 (o el que configuraste)
3. CORS bloqueado → El backend ya tiene CORS habilitado, pero asegúrate de que esté corriendo

### No se cargan los partidos
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el backend esté corriendo
4. Verifica tu API Key en `.env`

### Límite de peticiones excedido (429)
**Solución:**
- Football-Data.org tiene límite de 10 requests/minuto
- Espera 1 minuto antes de recargar
- Considera implementar caché (próxima versión)

---

## 🎯 COMANDOS ÚTILES

### Backend
```bash
# Iniciar servidor
npm start

# Iniciar con auto-reload (modo desarrollo)
npm run dev

# Ver logs del servidor
# Los verás en la misma terminal donde corriste npm start
```

### Frontend
```bash
# No necesita comandos especiales
# Solo abre index.html en el navegador
```

---

## 📦 PRÓXIMOS PASOS

Una vez que todo funcione, puedes:

1. ✅ Implementar caché con localStorage
2. ✅ Agregar más ligas
3. ✅ Mejorar el diseño
4. ✅ Agregar notificaciones
5. ✅ Crear una PWA (app instalable)
6. ✅ Desplegar en Vercel/Netlify

---

## 🆘 ¿NECESITAS AYUDA?

Si algo no funciona:
1. Revisa los logs del backend en la terminal
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que ambos (backend y frontend) estén corriendo
4. Asegúrate de que las carpetas tengan la estructura correcta

---

## 🔒 SEGURIDAD

**IMPORTANTE:**
- ✅ NUNCA subas el archivo `.env` a Git
- ✅ El archivo `.gitignore` ya está configurado para protegerlo
- ✅ Tu API Key ahora está segura en el backend
- ✅ El frontend no expone información sensible

---

¡Disfruta Cobra Scores! 🐍⚽
