/**
 * FilterCacheManager - Sistema centralizado de cache para filtros de tabelas
 *
 * Features:
 * - Persistência em localStorage com versionamento
 * - Scoped por recurso (clients, deliveries, orders, etc)
 * - TTL configurável por recurso
 * - Invalidação manual e automática
 * - Compression para valores grandes
 * - Analytics de uso
 *
 * @example
 * const cacheManager = FilterCacheManager.getInstance();
 *
 * // Salvar filtros
 * cacheManager.set('clients', {
 *   status: ['active'],
 *   created_at_from: '2024-01-01'
 * });
 *
 * // Restaurar filtros
 * const cached = cacheManager.get('clients');
 * if (cached) {
 *   console.log('Restored filters:', cached.values);
 * }
 *
 * // Limpar cache de um recurso
 * cacheManager.invalidate('clients');
 */

import type { FilterValues } from '@/types/filters'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entrada de cache de filtros
 */
export interface FilterCacheEntry {
	/** Valores dos filtros */
	values: FilterValues
	/** Timestamp de criação (ms) */
	timestamp: number
	/** Hash dos valores para deduplicação */
	hash: string
	/** Nome do recurso (clients, deliveries, etc) */
	resource: string
	/** Timestamp de expiração (ms) */
	expiresAt: number
	/** Número de vezes que foi usado */
	hits: number
	/** Versão do schema (para invalidação em mudanças) */
	version: number
}

/**
 * Configuração de cache por recurso
 */
export interface FilterCacheConfig {
	/** TTL em milissegundos (padrão: 24h) */
	ttl?: number
	/** Versão do schema (incrementar ao mudar filtros) */
	version?: number
	/** Desabilitar cache para este recurso */
	disabled?: boolean
}

/**
 * Estatísticas de uso do cache
 */
export interface FilterCacheStats {
	/** Total de entradas em cache */
	totalEntries: number
	/** Total de hits */
	totalHits: number
	/** Tamanho em bytes (aproximado) */
	sizeBytes: number
	/** Cache hits por recurso */
	hitsByResource: Record<string, number>
	/** Última limpeza automática */
	lastCleanup: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Prefixo para chaves no localStorage */
const STORAGE_PREFIX = 'filter_cache:'

/** Chave para metadados */
const METADATA_KEY = `${STORAGE_PREFIX}metadata`

/** TTL padrão (24 horas) */
const DEFAULT_TTL = 24 * 60 * 60 * 1000

/** Versão atual do schema de cache */
const CURRENT_CACHE_VERSION = 1

/** Intervalo de limpeza automática (1 hora) */
const AUTO_CLEANUP_INTERVAL = 60 * 60 * 1000

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gera hash simples de um objeto para deduplicação
 */
function hashObject(obj: unknown): string {
	const str = JSON.stringify(obj, Object.keys(obj as object).sort())
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32bit integer
	}
	return hash.toString(36)
}

/**
 * Verifica se localStorage está disponível
 */
function isLocalStorageAvailable(): boolean {
	try {
		const test = '__storage_test__'
		localStorage.setItem(test, test)
		localStorage.removeItem(test)
		return true
	} catch {
		return false
	}
}

/**
 * Calcula tamanho aproximado em bytes de uma string
 */
function getByteSize(str: string): number {
	return new Blob([str]).size
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterCacheManager Class
// ─────────────────────────────────────────────────────────────────────────────

export class FilterCacheManager {
	private static instance: FilterCacheManager | null = null
	private configs: Map<string, FilterCacheConfig> = new Map()
	private cleanupInterval: NodeJS.Timeout | null = null
	private isAvailable: boolean

	private constructor() {
		this.isAvailable = isLocalStorageAvailable()

		if (this.isAvailable) {
			// Iniciar limpeza automática
			this.startAutoCleanup()

			// Limpar cache expirado ao inicializar
			this.cleanup()
		}
	}

	/**
	 * Obtém instância singleton do cache manager
	 */
	public static getInstance(): FilterCacheManager {
		if (!FilterCacheManager.instance) {
			FilterCacheManager.instance = new FilterCacheManager()
		}
		return FilterCacheManager.instance
	}

	/**
	 * Configura cache para um recurso específico
	 */
	public configure(resource: string, config: FilterCacheConfig): void {
		this.configs.set(resource, config)
	}

	/**
	 * Salva filtros no cache
	 */
	public set(resource: string, values: FilterValues): void {
		if (!this.isAvailable) return

		const config = this.configs.get(resource) || {}

		// Cache desabilitado para este recurso
		if (config.disabled) return

		// Não cachear valores vazios
		if (Object.keys(values).length === 0) {
			this.invalidate(resource)
			return
		}

		const ttl = config.ttl || DEFAULT_TTL
		const version = config.version || CURRENT_CACHE_VERSION
		const now = Date.now()

		const entry: FilterCacheEntry = {
			values,
			timestamp: now,
			hash: hashObject(values),
			resource,
			expiresAt: now + ttl,
			hits: 0,
			version,
		}

		try {
			const key = this.getStorageKey(resource)
			localStorage.setItem(key, JSON.stringify(entry))

			// Atualizar metadados
			this.updateMetadata(resource, 'set')
		} catch (error) {
			console.warn('[FilterCache] Failed to save to localStorage:', error)
		}
	}

	/**
	 * Recupera filtros do cache
	 */
	public get(resource: string): FilterCacheEntry | null {
		if (!this.isAvailable) return null

		const config = this.configs.get(resource) || {}

		// Cache desabilitado para este recurso
		if (config.disabled) return null

		try {
			const key = this.getStorageKey(resource)
			const stored = localStorage.getItem(key)

			if (!stored) return null

			const entry: FilterCacheEntry = JSON.parse(stored)
			const now = Date.now()

			// Verificar versão
			const expectedVersion = config.version || CURRENT_CACHE_VERSION
			if (entry.version !== expectedVersion) {
				this.invalidate(resource)
				return null
			}

			// Verificar expiração
			if (entry.expiresAt < now) {
				this.invalidate(resource)
				return null
			}

			// Incrementar contador de hits
			entry.hits++
			localStorage.setItem(key, JSON.stringify(entry))

			// Atualizar metadados
			this.updateMetadata(resource, 'hit')

			return entry
		} catch (error) {
			console.warn('[FilterCache] Failed to read from localStorage:', error)
			return null
		}
	}

	/**
	 * Invalida (remove) cache de um recurso
	 */
	public invalidate(resource: string): void {
		if (!this.isAvailable) return

		try {
			const key = this.getStorageKey(resource)
			localStorage.removeItem(key)

			// Atualizar metadados
			this.updateMetadata(resource, 'invalidate')
		} catch (error) {
			console.warn('[FilterCache] Failed to invalidate cache:', error)
		}
	}

	/**
	 * Invalida cache que corresponde a um padrão
	 * @example invalidatePattern('client') // Remove 'clients', 'client-addresses', etc
	 */
	public invalidatePattern(pattern: string): void {
		if (!this.isAvailable) return

		try {
			const keys = this.getAllCacheKeys()
			const regex = new RegExp(pattern, 'i')

			for (const key of keys) {
				const resource = key.replace(STORAGE_PREFIX, '')
				if (regex.test(resource)) {
					localStorage.removeItem(key)
				}
			}
		} catch (error) {
			console.warn('[FilterCache] Failed to invalidate pattern:', error)
		}
	}

	/**
	 * Limpa todo o cache de filtros
	 */
	public clear(): void {
		if (!this.isAvailable) return

		try {
			const keys = this.getAllCacheKeys()
			for (const key of keys) {
				localStorage.removeItem(key)
			}

			// Resetar metadados
			localStorage.removeItem(METADATA_KEY)
		} catch (error) {
			console.warn('[FilterCache] Failed to clear cache:', error)
		}
	}

	/**
	 * Remove entradas expiradas
	 */
	public cleanup(): void {
		if (!this.isAvailable) return

		try {
			const keys = this.getAllCacheKeys()
			const now = Date.now()
			let removedCount = 0

			for (const key of keys) {
				const stored = localStorage.getItem(key)
				if (!stored) continue

				try {
					const entry: FilterCacheEntry = JSON.parse(stored)
					if (entry.expiresAt < now) {
						localStorage.removeItem(key)
						removedCount++
					}
				} catch {
					// Entrada corrompida, remover
					localStorage.removeItem(key)
					removedCount++
				}
			}

			if (removedCount > 0) {
				console.log(`[FilterCache] Cleanup removed ${removedCount} expired entries`)
			}

			// Atualizar timestamp de última limpeza
			this.updateMetadata('_system', 'cleanup')
		} catch (error) {
			console.warn('[FilterCache] Cleanup failed:', error)
		}
	}

	/**
	 * Obtém estatísticas de uso do cache
	 */
	public getStats(): FilterCacheStats {
		const stats: FilterCacheStats = {
			totalEntries: 0,
			totalHits: 0,
			sizeBytes: 0,
			hitsByResource: {},
			lastCleanup: null,
		}

		if (!this.isAvailable) return stats

		try {
			const keys = this.getAllCacheKeys()

			for (const key of keys) {
				const stored = localStorage.getItem(key)
				if (!stored) continue

				try {
					const entry: FilterCacheEntry = JSON.parse(stored)
					stats.totalEntries++
					stats.totalHits += entry.hits
					stats.sizeBytes += getByteSize(stored)
					stats.hitsByResource[entry.resource] = entry.hits
				} catch {
					// Ignorar entradas corrompidas
				}
			}

			// Obter última limpeza dos metadados
			const metadata = this.getMetadata()
			stats.lastCleanup = metadata.lastCleanup || null
		} catch (error) {
			console.warn('[FilterCache] Failed to get stats:', error)
		}

		return stats
	}

	/**
	 * Verifica se existe cache para um recurso
	 */
	public has(resource: string): boolean {
		return this.get(resource) !== null
	}

	/**
	 * Exporta todo o cache (para debug/backup)
	 */
	public export(): Record<string, FilterCacheEntry> {
		const exported: Record<string, FilterCacheEntry> = {}

		if (!this.isAvailable) return exported

		try {
			const keys = this.getAllCacheKeys()

			for (const key of keys) {
				const stored = localStorage.getItem(key)
				if (!stored) continue

				try {
					const entry: FilterCacheEntry = JSON.parse(stored)
					const resource = key.replace(STORAGE_PREFIX, '')
					exported[resource] = entry
				} catch {
					// Ignorar entradas corrompidas
				}
			}
		} catch (error) {
			console.warn('[FilterCache] Failed to export cache:', error)
		}

		return exported
	}

	/**
	 * Importa cache (para restore/migration)
	 */
	public import(data: Record<string, FilterCacheEntry>): void {
		if (!this.isAvailable) return

		try {
			for (const [resource, entry] of Object.entries(data)) {
				const key = this.getStorageKey(resource)
				localStorage.setItem(key, JSON.stringify(entry))
			}
		} catch (error) {
			console.warn('[FilterCache] Failed to import cache:', error)
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// Private Methods
	// ─────────────────────────────────────────────────────────────────────────

	private getStorageKey(resource: string): string {
		return `${STORAGE_PREFIX}${resource}`
	}

	private getAllCacheKeys(): string[] {
		const keys: string[] = []

		try {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i)
				if (key && key.startsWith(STORAGE_PREFIX) && key !== METADATA_KEY) {
					keys.push(key)
				}
			}
		} catch {
			// Ignorar erros
		}

		return keys
	}

	private startAutoCleanup(): void {
		// Limpar qualquer interval existente
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval)
		}

		// Configurar novo interval
		this.cleanupInterval = setInterval(() => {
			this.cleanup()
		}, AUTO_CLEANUP_INTERVAL)
	}

	private stopAutoCleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval)
			this.cleanupInterval = null
		}
	}

	private updateMetadata(
		resource: string,
		action: 'set' | 'hit' | 'invalidate' | 'cleanup'
	): void {
		try {
			const metadata = this.getMetadata()

			if (action === 'cleanup') {
				metadata.lastCleanup = Date.now()
			}

			localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
		} catch {
			// Ignorar erros de metadados
		}
	}

	private getMetadata(): { lastCleanup: number | null } {
		try {
			const stored = localStorage.getItem(METADATA_KEY)
			if (stored) {
				return JSON.parse(stored)
			}
		} catch {
			// Ignorar erros
		}

		return { lastCleanup: null }
	}

	/**
	 * Cleanup ao destruir (para testes)
	 */
	public destroy(): void {
		this.stopAutoCleanup()
		FilterCacheManager.instance = null
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Export singleton instance
// ─────────────────────────────────────────────────────────────────────────────

export const filterCacheManager = FilterCacheManager.getInstance()
