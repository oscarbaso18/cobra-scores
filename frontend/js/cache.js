// ===============================================
// SISTEMA DE CACHE CON LOCALSTORE
// Archivo: frontend/js/cache.js
// ===============================================

const CacheManager = {
    // Tiempo de expiracion: 5 minutos (en milisegundos)
    CACHE_DURATION: 5 * 60 * 1000,

    // Prefijo para las keys del cache
    PREFIX: 'cobra_scores_',

    /** 
     * Guarda datos en el cache
     * @param {string} key - Identificador unico
     * @param {any} data - Datos a guardar
     * @returns {boolean} - true si se guardo correctamente
     */
    set(key, data) {
        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                expiresAt: Date.now() + this.CACHE_DURATION
            };

            const cacheKey = this.PREFIX + key;
            localStorage.setItem(cacheKey, JSON.stringify(cacheItem));

            console.log(`✅ Cache guardado: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Error al guardar cache:', error);
            return false;
        }
    },

    /**
     * Obtiene datos del cache si no han expirado
     * @param {string} key - Identificador unico
     * @returns {any|null} - Datos o null si n existe/expiro
     */
    get(key) {
        try {
            const cacheKey = this.PREFIX + key;
            const cached = localStorage.getItem(cacheKey);

            if (!cached) {
                console.log(`No hay cache para: ${key}`);
                return null;
            }

            const cacheItem = JSON.parse(cached);

            //Verificar si expiro
            if (Date.now() > cacheItem.expiresAt) {
                console.log(`Cache expirado para ${key}`);
                this.remove(key);
                return null;
            }

            console.log(`Cache encontrado: ${key} (${this.getAge(cacheItem.timestamp)}s de antiguedad)`);
            return cacheItem.data;
        } catch (error) {
            console.error('Error al leer cache:', error);
            return null;
        }
    },

    /**
     * Elimina un item del cache
     * @param {string} key - Identificado unico
     */
    remove(key) {
        const cacheKey = this.PREFIX + key;
        localStorage.removeItem(cacheKey);
        console.log(`Cache eliminado: ${key}`);
    },

    /**
     * Limpia todo el cache de Cobra Scores
     */
    clear() {
        const keys = Object.keys(localStorage);
        let count = 0;
        keys.forEach(key => {
            if (key.startsWith(this.PREFIX)) {
                localStorage.removeItem(key);
                count++;
            }
        });
        console.log(`Cache limpiado: ${count} items eliminados`);
    },

    /**
     * Obtiene la antiguedad de un timestamp en segundos
     * @param {number} timestamp
     * @returns {number}
     */
    getAge(timestamp) {
        return Math.floor((Date.now() - timestamp) / 1000);
    },

    /** Obtiiene informacion del cache
     * @returns {object} - Estadisticas del cache
     */
    getStats() {
        const keys = Object.keys(localStorage);
        const cobraKeys = keys.filter(key => key.startsWith(this.PREFIX));

        const stats = {
            totalItems: cobraKeys.length,
            items: []
        };

        cobraKeys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                const keyName = key.replace(this.PREFIX, '');
                const age = this.getAge(parsed.timestamp);
                const ttl = Math.floor((parsed.expiresAt - Date.now()) / 1000);

                stats.items.push({
                    key: keyName,
                    age: `${age}s`,
                    ttl: ttl > 0 ? `${ttl}s` : 'expirado',
                    size: `${(item.length / 1024).toFixed(2)} KB`
                });
            }
        });

        return stats;
    }
};

// Hacer disponible globalmente
window.CacheManager = CacheManager;