document.addEventListener('DOMContentLoaded', () => {
    // URL de tu backend local
    const API_URL = 'http://localhost:3000/api';

    const matchesContainer = document.getElementById('matches-container');
    const calendarContainer = document.getElementById('calendar-container');
    const standingsContainer = document.getElementById('standings-container');
    const leagueSelect = document.getElementById('league-select');
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');

    // Función para mostrar secciones
    function showSection(sectionId) {
        sections.forEach(section => section.style.display = 'none');
        document.getElementById(sectionId).style.display = 'block';
        
        // Actualizar enlaces activos
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`[data-section="${sectionId.replace('-section', '')}"]`);
        if (activeLink) activeLink.classList.add('active');
    }

    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionToShow = e.target.dataset.section + '-section';
            showSection(sectionToShow);

            if (sectionToShow === 'results-section') {
                fetchMatches('FINISHED');
            } else if (sectionToShow === 'calendar-section') {
                fetchMatches('SCHEDULED');
            } else if (sectionToShow === 'standings-section') {
                fetchStandings();
            }
        });
    });

    // Cambio de liga
    leagueSelect.addEventListener('change', () => {
        const visibleSection = [...sections].find(section => section.style.display === 'block');
        if (visibleSection.id === 'results-section') {
            fetchMatches('FINISHED');
        } else if (visibleSection.id === 'calendar-section') {
            fetchMatches('SCHEDULED');
        } else if (visibleSection.id === 'standings-section') {
            fetchStandings();
        }
    });

   // Función para hacer peticiones al backend
async function fetchData(endpoint) {
    // Crear key única para el cache basada en el endpoint
    const cacheKey = endpoint.replace(/\//g, '_').replace(/\?/g, '_').replace(/=/g, '_');

    // Intentar obtener del cache primero
    const cached = CacheManager.get(cacheKey);
    if (cached) {
        console.log('📦 Datos cargados desde cache (rápido!)');
        return cached;
    }

    // Si no hay cache, hacer petición a la API
    try {
        console.log('🌐 Obteniendo datos frescos de la API...');
        const response = await fetch(`${API_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Guardar en cache para la próxima vez
        CacheManager.set(cacheKey, data);

        return data;
    } catch (error) {
        console.error('Error al obtener datos:', error);

        if (error.message.includes('Failed to fetch')) {
            alert('⚠️ No se puede conectar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000');
        }

        return null;
    }
}

    // Función para obtener partidos
    async function fetchMatches(status = 'FINISHED') {
        const competitionId = leagueSelect.value || 'PL';
        const container = (status === 'FINISHED') ? matchesContainer : calendarContainer;
        
        // Mostrar skeleton loader
        container.innerHTML = createSkeletonLoader(3);

        const data = await fetchData(`/matches/${competitionId}?status=${status}`);
        
        if (data?.matches?.length > 0) {
            container.innerHTML = '';
            data.matches.forEach(match => {
                const date = new Date(match.utcDate);
                const card = document.createElement('div');
                card.classList.add('match-card');
                
                // Formatear fecha y hora
                const dateStr = date.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const timeStr = date.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                card.innerHTML = `
                    <h3>${match.homeTeam.name} vs ${match.awayTeam.name}</h3>
                    <p><strong>🏆 Liga:</strong> ${match.competition.name}</p>
                    <p><strong>📅 Fecha:</strong> ${dateStr}</p>
                    <p><strong>🕐 Hora:</strong> ${timeStr}</p>
                    ${
                        match.score.fullTime.home !== null
                        ? `<p><strong>⚽ Resultado:</strong> <span style="font-size: 1.3em; color: #ffa726;">${match.score.fullTime.home} - ${match.score.fullTime.away}</span></p>`
                        : `<p><strong>📊 Estado:</strong> ${translateStatus(match.status)}</p>`
                    }
                `;
                
                // Animación de entrada
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                container.appendChild(card);
                
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            });
        } else if (data?.matches?.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; font-size: 1.2rem;">📭 No hay partidos disponibles para esta selección.</p>';
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ff6b6b;">❌ Error al cargar los partidos. Verifica tu conexión.</p>';
        }
    }

    // Función para obtener clasificaciones
    async function fetchStandings() {
        const competitionId = leagueSelect.value || 'PL';
        standingsContainer.innerHTML = createSkeletonLoader(5);

        const data = await fetchData(`/standings/${competitionId}`);
        
        if (data?.standings?.length > 0) {
            standingsContainer.innerHTML = '';
            data.standings[0].table.forEach((team, index) => {
                const card = document.createElement('div');
                card.classList.add('team-card');
                
                // Añadir clase especial para primeras posiciones
                let positionClass = '';
                if (team.position <= 4) positionClass = 'champions-zone';
                else if (team.position <= 6) positionClass = 'europa-zone';
                else if (team.position >= data.standings[0].table.length - 2) positionClass = 'relegation-zone';

                card.innerHTML = `
                    <div class="team-header ${positionClass}">
                        <h3>${team.position}. ${team.team.name}</h3>
                        ${team.team.crest ? `<img src="${team.team.crest}" alt="${team.team.name}" style="width: 40px; height: 40px; margin-left: 10px;">` : ''}
                    </div>
                    <div class="team-stats">
                        <p><strong>🎮 Jugados:</strong> ${team.playedGames}</p>
                        <p><strong>✅ Ganados:</strong> ${team.won}</p>
                        <p><strong>🤝 Empatados:</strong> ${team.draw}</p>
                        <p><strong>❌ Perdidos:</strong> ${team.lost}</p>
                        <p><strong>⭐ Puntos:</strong> <span style="font-size: 1.3em; color: #ffa726;">${team.points}</span></p>
                        <p><strong>⚽ Goles favor:</strong> ${team.goalsFor}</p>
                        <p><strong>🥅 Goles contra:</strong> ${team.goalsAgainst}</p>
                        <p><strong>📊 Diferencia:</strong> ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}</p>
                    </div>
                `;
                
                // Animación de entrada
                card.style.opacity = '0';
                card.style.transform = 'translateX(-20px)';
                standingsContainer.appendChild(card);
                
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0)';
                }, index * 50);
            });
        } else {
            standingsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ff6b6b;">❌ Error al cargar las clasificaciones.</p>';
        }
    }

    // Función para crear skeleton loader
    function createSkeletonLoader(count = 3) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-card">
                    <div class="skeleton-line" style="width: 70%; height: 24px; margin-bottom: 10px;"></div>
                    <div class="skeleton-line" style="width: 50%; height: 16px; margin-bottom: 8px;"></div>
                    <div class="skeleton-line" style="width: 60%; height: 16px; margin-bottom: 8px;"></div>
                    <div class="skeleton-line" style="width: 40%; height: 16px;"></div>
                </div>
            `;
        }
        return html;
    }

    // Función para traducir estados
    function translateStatus(status) {
        const translations = {
            'SCHEDULED': 'Programado',
            'LIVE': '🔴 En vivo',
            'IN_PLAY': '🔴 En juego',
            'PAUSED': '⏸️ Pausado',
            'FINISHED': 'Finalizado',
            'POSTPONED': 'Pospuesto',
            'CANCELLED': 'Cancelado',
            'SUSPENDED': 'Suspendido'
        };
        return translations[status] || status;
    }

    // Boton para limpiar cache
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            if (confirm('¿Quieres limpiar el cache? Se recargarán todos los datos.')) {
                CacheManager.clear();
                alert('✅ Cache limpiado correctamente');
                location.reloaded();
            }
        });
    }

    // Mostrar estadisticas del cache en consola (opcional)
    console.log('📊 Estadísticas del cache:', CacheManager.getStats());

    // Cargar partidos al iniciar
    fetchMatches('FINISHED');
});
