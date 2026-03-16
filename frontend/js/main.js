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

            // Ordenar partidos por fecha (mas recientes primero)
            const sortedMatches = data.matches.sort((a, b) => {
                const dateA = new Date(a.utcDate);
                const dateB = new Date(b.utcDate);

                if (status === 'FINISHED') {
                    // Resultados: mas recientes primero (descnedente)
                    return dateB - dateA;
                } else {
                    // Calendario: mas proximos primero (ascendente)
                    return dateA - dateB;
                }
               
            });

            sortedMatches.forEach(match => {
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
                
                // Obtener logos de equipos
                const homeTeamLogo = match.homeTeam.crest || '';
                const awayTeamLogo = match.awayTeam.crest || '';

                card.innerHTML = `
                    <div class="match-teams">
                        <div class="match-team">
                            ${homeTeamLogo ? `<img src="${homeTeamLogo}" alt="${match.homeTeam.name}" class="match-team-logo" loading="lazy">` : ''}
                            <span class="match-team-name">${match.homeTeam.shortName || match.homeTeam.name}</span>
                        </div>
                        <div class="match-vs">VS</div>
                        <div class="match-team">
                            ${awayTeamLogo ? `<img src="${awayTeamLogo}" alt="${match.awayTeam.name}" class="match-team-logo" loading="lazy">` : ''}
                            <span class="match-team-name">${match.awayTeam.shortName || match.awayTeam.name}</span>
                        </div>
                    </div>
                    
                    ${
                        match.score.fullTime.home !== null
                        ? `<div class="match-score">
                            <span class="score-home">${match.score.fullTime.home}</span>
                            <span class="score-separator">-</span>
                            <span class="score-away">${match.score.fullTime.away}</span>
                        </div>`
                        : `<div class="match-status">${translateStatus(match.status)}</div>`
                    }
                    
                    <div class="match-details">
                        <div class="match-detail">
                            <span class="detail-label">🏆 Liga:</span>
                            <span class="detail-value">${match.competition.name}</span>
                        </div>
                        <div class="match-detail">
                            <span class="detail-label">📅 Fecha:</span>
                            <span class="detail-value">${dateStr}</span>
                        </div>
                        <div class="match-detail">
                            <span class="detail-label">🕐 Hora:</span>
                            <span class="detail-value">${timeStr}</span>
                        </div>
                    </div>
                `;
                
                // Hacer clickeable solo si el partido ya terminó o está en vivo
                if (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'LIVE') {
                    card.classList.add('clickable');
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => {
                        openMatchModal(match.id, match);
                    });
                    
                    // Efecto hover adicional para indicar que es clickeable
                    card.addEventListener('mouseenter', () => {
                        card.style.cursor = 'pointer';
                    });
                }

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

// Función para obtener clasificaciones y goleadores
async function fetchStandings() {
    const competitionId = leagueSelect.value || 'PL';
    standingsContainer.innerHTML = createSkeletonLoader(5);

    // Obtener clasificaciones, goleadores y asistidores en paralelo
    const [standingsData, scorersData] = await Promise.all([
        fetchData(`/standings/${competitionId}`),
        fetchData(`/scorers/${competitionId}?limit=10`),
    ]);
    
    if (standingsData?.standings?.length > 0) {
        standingsContainer.innerHTML = '';
        
        // Crear contenedor principal con grid
        const mainContainer = document.createElement('div');
        mainContainer.className = 'standings-main-container';
        
        // COLUMNA IZQUIERDA: Tabla de clasificaciones
        const tableContainer = document.createElement('div');
        tableContainer.className = 'standings-table-container';
        
        // Crear tabla HTML
        const table = document.createElement('table');
        table.className = 'standings-table';
        
        // Header de la tabla
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="pos-col">#</th>
                    <th class="team-col">Equipo</th>
                    <th class="stat-col" title="Jugados">PJ</th>
                    <th class="stat-col" title="Ganados">G</th>
                    <th class="stat-col" title="Empatados">E</th>
                    <th class="stat-col" title="Perdidos">P</th>
                    <th class="stat-col" title="Goles a favor">GF</th>
                    <th class="stat-col" title="Goles en contra">GC</th>
                    <th class="stat-col" title="Diferencia de goles">DG</th>
                    <th class="pts-col">PTS</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        // Llenar filas
        standingsData.standings[0].table.forEach((team, index) => {
            const row = document.createElement('tr');
            
            // Determinar zona (Champions, Europa, Descenso)
            let zoneClass = '';
            if (team.position <= 4) zoneClass = 'champions-zone';
            else if (team.position <= 6) zoneClass = 'europa-zone';
            else if (team.position >= standingsData.standings[0].table.length - 2) zoneClass = 'relegation-zone';
            
            row.className = zoneClass;
            
            const teamLogoUrl = team.team.crest || '';
            
            row.innerHTML = `
                <td class="pos-col"><strong>${team.position}</strong></td>
                <td class="team-col">
                    <div class="team-info">
                        ${teamLogoUrl ? `<img src="${teamLogoUrl}" alt="${team.team.name}" class="team-logo" loading="lazy">` : ''}
                        <span class="team-name">${team.team.name}</span>
                    </div>
                </td>
                <td class="stat-col">${team.playedGames}</td>
                <td class="stat-col stat-won">${team.won}</td>
                <td class="stat-col stat-draw">${team.draw}</td>
                <td class="stat-col stat-lost">${team.lost}</td>
                <td class="stat-col">${team.goalsFor}</td>
                <td class="stat-col">${team.goalsAgainst}</td>
                <td class="stat-col ${team.goalDifference >= 0 ? 'stat-positive' : 'stat-negative'}">
                    ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}
                </td>
                <td class="pts-col"><strong>${team.points}</strong></td>
            `;
            
            // Animación
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            tbody.appendChild(row);
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });
        
        tableContainer.appendChild(table);
        
        // COLUMNA DERECHA: Goleadores
        const scorersContainer = document.createElement('div');
        scorersContainer.className = 'scorers-container';
        
        scorersContainer.innerHTML = '<h3 class="scorers-title">⚽ Top Goleadores</h3>';
        
        if (scorersData?.scorers?.length > 0) {
            const scorersList = document.createElement('div');
            scorersList.className = 'scorers-list';
            
            scorersData.scorers.forEach((scorer, index) => {
                const scorerItem = document.createElement('div');
                scorerItem.className = 'scorer-item';
                
                scorerItem.innerHTML = `
                    <div class="scorer-rank">${index + 1}</div>
                    <div class="scorer-info">
                        <div class="scorer-name">${scorer.player.name}</div>
                        <div class="scorer-team">${scorer.team.name}</div>
                    </div>
                    <div class="scorer-stats">
                        <div class="scorer-goals">${scorer.goals}</div>
                        <div class="scorer-label">goles</div>
                    </div>
                `;
                
                // Animación
                scorerItem.style.opacity = '0';
                scorerItem.style.transform = 'translateX(20px)';
                scorersList.appendChild(scorerItem);
                
                setTimeout(() => {
                    scorerItem.style.transition = 'all 0.3s ease';
                    scorerItem.style.opacity = '1';
                    scorerItem.style.transform = 'translateX(0)';
                }, index * 100);
            });
            
            scorersContainer.appendChild(scorersList);
        } else {
            scorersContainer.innerHTML += '<p class="no-data">No hay datos de goleadores disponibles</p>';
        }    

        // Agregar ambas columnas al contenedor principal
        mainContainer.appendChild(tableContainer);
        mainContainer.appendChild(scorersContainer);
        
        standingsContainer.appendChild(mainContainer);
        
    } else {
        standingsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ff6b6b;">❌ Error al cargar las clasificaciones.</p>';
    }
}

// Función para obtener goleadores
async function fetchScorers(competitionId, limit = 5) {
    const data = await fetchData(`/scorers/${competitionId}?limit=${limit}`);
    
    if (data?.scorers?.length > 0) {
        return data.scorers;
    }
    return [];
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

    // ============================================
    // MODO OSCURO - TOGGLE Y PERSISTENCIA
    // ===================================
    
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Funcion para aplicar tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.textContent = '🌙';
        } else {
            body.classList.remove('dark-mode');
            themeToggle.textContent = '☀️';
        }
    }

    //Cargar tema guardado al iniciar
    const savedTheme = localStorage.getItem('cobra-theme') || 'light';
    applyTheme(savedTheme);
    console.log(`🎨 Tema cargado: ${savedTheme}`);

    //Toggle al hacer clic
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        applyTheme(newTheme);
        localStorage.setItem('cobra-theme', newTheme);
        console.log(`🎨 Tema cambiado a: ${newTheme}`);
    });

    // ============================================
    // LIVE UPDATES - ACTUALIZACION AUTOMATICA
    // ============================================

    const AUTO_UPDATE_DELAY = 30000; // 30 SEGUNDOS

    // Funcion para actualizar partidos automaticamente
    function autoUpdateMatches() {
        //Solo actualizar si estamos en la seccion de resultados
        const resultsSection = document.getElementById('results-section');
        const isResultsVisible = resultsSection.style.display !== 'none' && window.getComputedStyle(resultsSection).display !== 'none';

        if (isResultsVisible) {
            console.log('Actualización automática: Obteniendo partidos...');
            fetchMatches('FINISHED');
        }
    }

    // Iniciar actualizacion automatica
    setInterval(autoUpdateMatches, AUTO_UPDATE_DELAY);
    console.log('Actualización automática iniciada (cada 30 segundos)')

    // Cargar partidos al iniciar
    fetchMatches('FINISHED');

    // ============================================
    // MODAL DE ESTADÍSTICAS DEL PARTIDO
    // ============================================
    
    const matchModal = document.getElementById('match-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.querySelector('.modal-close');
    
    // Cerrar modal
    function closeModal() {
        matchModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Cerrar al hacer clic fuera del modal
    matchModal.addEventListener('click', (e) => {
        if (e.target === matchModal) {
            closeModal();
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && matchModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Función para abrir modal con estadísticas
    async function openMatchModal(matchId, match) {
        matchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Mostrar loading
        modalBody.innerHTML = `
            <div class="modal-loading">
                <div class="spinner"></div>
                <p>Cargando estadísticas del partido...</p>
            </div>
        `;
        
        // Obtener datos completos del partido
        const matchData = await fetchData(`/match/${matchId}`);
        
        if (!matchData) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="color: var(--danger-color);">Error al cargar las estadísticas del partido.</p>
                </div>
            `;
            return;
        }
        
        // Generar HTML del modal
        modalBody.innerHTML = generateModalContent(matchData);
    }
    
    // Generar contenido del modal
    function generateModalContent(match) {
        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;
        const score = match.score;
        
        let html = `
            <div class="modal-header">
                <div class="modal-match-info">
                    ${match.competition.name} • ${new Date(match.utcDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                
                <div class="modal-teams">
                    <div class="modal-team">
                        ${homeTeam.crest ? `<img src="${homeTeam.crest}" alt="${homeTeam.name}" class="modal-team-logo">` : ''}
                        <div class="modal-team-name">${homeTeam.name}</div>
                    </div>
                    
                    <div class="modal-score">
                        <span>${score.fullTime.home || 0}</span>
                        <span style="font-size: 1.5rem; color: var(--cobra-green);">-</span>
                        <span>${score.fullTime.away || 0}</span>
                    </div>
                    
                    <div class="modal-team">
                        ${awayTeam.crest ? `<img src="${awayTeam.crest}" alt="${awayTeam.name}" class="modal-team-logo">` : ''}
                        <div class="modal-team-name">${awayTeam.name}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Goleadores
        if (match.goals && match.goals.length > 0) {
            html += `
                <div class="scorers-section">
                    <h3 class="section-title">⚽ Goleadores</h3>
                    <div class="goals-list">
            `;
            
            match.goals.forEach(goal => {
                const isHome = goal.team.id === homeTeam.id;
                const teamLogo = isHome ? homeTeam.crest : awayTeam.crest;
                
                html += `
                    <div class="goal-item">
                        ${teamLogo ? `<img src="${teamLogo}" alt="Team" class="goal-team">` : ''}
                        <div class="goal-info">
                            <div class="goal-player">${goal.scorer.name}</div>
                            ${goal.assist ? `<div class="goal-type">Asistencia: ${goal.assist.name}</div>` : ''}
                        </div>
                        <div class="goal-time">${goal.minute}'</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        // Estadísticas del partido (si existen)
        if (match.statistics && match.statistics.length > 0) {
            html += `<div class="stats-section">`;
            
            const homeStats = match.statistics.find(s => s.team.id === homeTeam.id);
            const awayStats = match.statistics.find(s => s.team.id === awayTeam.id);
            
            if (homeStats && awayStats) {
                // Posesión
                if (homeStats.possession !== null) {
                    html += generateStatRow('Posesión', homeStats.possession, awayStats.possession, '%');
                }
                
                // Tiros totales
                if (homeStats.shots_total !== null) {
                    html += generateStatRow('Tiros', homeStats.shots_total, awayStats.shots_total);
                }
                
                // Tiros a puerta
                if (homeStats.shots_on_goal !== null) {
                    html += generateStatRow('Tiros a puerta', homeStats.shots_on_goal, awayStats.shots_on_goal);
                }
                
                // Corners
                if (homeStats.corner_kicks !== null) {
                    html += generateStatRow('Corners', homeStats.corner_kicks, awayStats.corner_kicks);
                }
                
                // Faltas
                if (homeStats.fouls !== null) {
                    html += generateStatRow('Faltas', homeStats.fouls, awayStats.fouls);
                }
            }
            
            html += `</div>`;
        }
        
        // Tarjetas amarillas y rojas
        if (match.bookings && match.bookings.length > 0) {
            const homeBookings = match.bookings.filter(b => b.team.id === homeTeam.id);
            const awayBookings = match.bookings.filter(b => b.team.id === awayTeam.id);
            
            html += `
                <div class="cards-section">
                    <div class="cards-team">
                        <h4 class="section-title" style="font-size: 1rem;">${homeTeam.shortName || homeTeam.name}</h4>
                        ${generateBookings(homeBookings)}
                    </div>
                    <div class="cards-team">
                        <h4 class="section-title" style="font-size: 1rem;">${awayTeam.shortName || awayTeam.name}</h4>
                        ${generateBookings(awayBookings)}
                    </div>
                </div>
            `;
        }
        
        return html;
    }
    
    // Generar fila de estadística con barra
    function generateStatRow(label, homeValue, awayValue, suffix = '') {
        const total = homeValue + awayValue || 1;
        const homePercent = (homeValue / total) * 100;
        const awayPercent = (awayValue / total) * 100;
        
        return `
            <div class="stat-row">
                <div class="stat-value">${homeValue}${suffix}</div>
                <div class="stat-bar-container">
                    <div class="stat-bar">
                        <div class="stat-fill-home" style="width: ${homePercent}%"></div>
                        <div class="stat-fill-away" style="width: ${awayPercent}%"></div>
                    </div>
                </div>
                <div class="stat-label">${label}</div>
                <div class="stat-value">${awayValue}${suffix}</div>
            </div>
        `;
    }
    
    // Generar tarjetas
    function generateBookings(bookings) {
        if (bookings.length === 0) {
            return '<p style="color: var(--text-secondary); font-size: 0.9rem;">Sin tarjetas</p>';
        }
        
        return bookings.map(booking => `
            <div class="card-item">
                <div class="card-icon ${booking.card === 'YELLOW_CARD' ? 'yellow-card' : 'red-card'}"></div>
                <div class="card-player">${booking.player.name}</div>
                <div class="card-time">${booking.minute}'</div>
            </div>
        `).join('');
    }

    // Cargar partidos al iniciar
    fetchMatches('FINISHED');
});   
