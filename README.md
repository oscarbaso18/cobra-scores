# 🐍 Cobra Scores

Aplicación web full-stack para consultar resultados deportivos en tiempo real de las principales ligas europeas de fútbol.

## 🚀 Tecnologías

### Backend
- Node.js
- Express.js
- Football-Data.org API
- CORS
- dotenv

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript ES6+ (Async/Await, Fetch API)

## ✨ Características

- ⚽ Resultados de partidos en tiempo real
- 📅 Calendario de próximos encuentros
- 🏆 Clasificaciones de liga
- 🎨 Diseño moderno y responsive
- 🔄 Animaciones suaves
- 🔒 API Key protegida en el backend
- 📊 Skeleton loaders para mejor UX

## 🏟️ Ligas Disponibles

- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
- 🇪🇸 LaLiga
- 🇩🇪 Bundesliga
- 🇮🇹 Serie A
- 🇫🇷 Ligue 1

## 📦 Instalación

### Requisitos previos
- Node.js v16 o superior
- npm
- Cuenta en Football-Data.org para obtener API Key

### Backend
```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend/`:
```
FOOTBALL_API_KEY=tu_api_key_aqui
PORT=3000
```

Inicia el servidor:
```bash
npm start
```

### Frontend

Abre `frontend/index.html` en tu navegador o usa Live Server.

## 🎯 Uso

1. Inicia el backend con `npm start`
2. Abre el frontend en tu navegador
3. Selecciona una liga del dropdown
4. Navega entre Resultados, Calendario y Clasificaciones

## 📸 Screenshots



## 🛠️ Arquitectura
```
Cliente (Navegador) → Frontend → Backend → API Football-Data.org
                    ↑_________________________________↓
                         Datos de partidos
```

El backend actúa como intermediario para:
- Proteger la API Key
- Manejar CORS
- Cachear peticiones (futuro)
- Rate limiting (futuro)

## 🔐 Seguridad

- API Key protegida en variables de entorno
- Backend como proxy seguro
- CORS configurado apropiadamente
- `.gitignore` previene subir datos sensibles

## 🚧 Próximas Mejoras

- [ ] Caché con localStorage
- [ ] Partidos en vivo con actualización automática
- [ ] Estadísticas de jugadores
- [ ] Modo oscuro/claro
- [ ] PWA (instalable en móvil)
- [ ] Más ligas y competiciones
- [ ] Notificaciones de goles

## 👨‍💻 Autor

**Oscar Baso**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- Football-Data.org por proporcionar la API
- Anthropic Claude por asistencia en desarrollo
