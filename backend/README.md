# 🐍 Cobra Scores Backend

Backend para la aplicación Cobra Scores - Resultados deportivos en tiempo real.

## 🚀 Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con tu API Key:
```
FOOTBALL_API_KEY=tu_api_key_aqui
PORT=3000
```

### 3. Iniciar el servidor
```bash
# Modo producción
npm start

# Modo desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

## 📡 Endpoints disponibles

### Obtener partidos
```
GET /api/matches/:competitionId?status=FINISHED

Parámetros:
- competitionId: Código de la liga (PL, PD, BL1, SA, FL1)
- status: Estado de los partidos (FINISHED, SCHEDULED, LIVE)

Ejemplo: http://localhost:3000/api/matches/PL?status=FINISHED
```

### Obtener clasificaciones
```
GET /api/standings/:competitionId

Parámetros:
- competitionId: Código de la liga (PL, PD, BL1, SA, FL1)

Ejemplo: http://localhost:3000/api/standings/PL
```

### Obtener información de competición
```
GET /api/competition/:competitionId

Parámetros:
- competitionId: Código de la liga (PL, PD, BL1, SA, FL1)

Ejemplo: http://localhost:3000/api/competition/PL
```

## 🏆 Códigos de ligas

- `PL` - Premier League (Inglaterra)
- `PD` - LaLiga (España)
- `BL1` - Bundesliga (Alemania)
- `SA` - Serie A (Italia)
- `FL1` - Ligue 1 (Francia)

## 🔒 Seguridad

- Nunca subas el archivo `.env` a Git
- La API Key está protegida en el backend
- CORS está habilitado para desarrollo local

## 📦 Dependencias

- **express**: Framework web
- **cors**: Manejo de CORS
- **dotenv**: Variables de entorno
- **nodemon**: Auto-reload en desarrollo (dev)

## 🐛 Solución de problemas

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "API Key no configurada"
Verifica que el archivo `.env` exista y contenga tu API Key.

### Error: "Port 3000 already in use"
Cambia el puerto en el archivo `.env`:
```
PORT=3001
```

## 📝 Notas

- El plan gratuito de Football-Data.org tiene límite de 10 requests/minuto
- Se recomienda implementar caché para reducir llamadas a la API
- Para producción, considera usar variables de entorno del hosting
