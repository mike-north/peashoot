/**
 * Base repository class providing common functionality for all repositories
 * Following DDD principles for data access abstraction
 */
export abstract class Repository<T extends { id: string }, ID extends string | number> {
	protected constructor(protected apiBaseUrl: string) {}

	/**
	 * Abstract method to convert a domain entity to an API resource
	 */
	protected abstract toDomainEntity(resource: unknown): T

	/**
	 * Abstract method to convert an API resource to a domain entity
	 */
	protected toResource(entity: T): unknown {
		// Return the entity directly, or transform it for the API if needed
		return entity
	}

	/**
	 * Get the endpoint path for this repository
	 */
	protected abstract getEndpoint(): string

	/**
	 * Common method to fetch all entities
	 */
	async findAll(): Promise<T[]> {
		try {
			const response = await fetch(`${this.apiBaseUrl}/${this.getEndpoint()}`)

			if (!response.ok) {
				throw new Error(`Failed to fetch entities: ${response.statusText}`)
			}

			const resources = (await response.json()) as unknown[]

			return Array.isArray(resources)
				? resources.map((resource) => this.toDomainEntity(resource))
				: []
		} catch (error) {
			console.error(`Error fetching ${this.getEndpoint()}:`, error)
			throw error
		}
	}

	/**
	 * Common method to find an entity by ID
	 */
	async findById(id: ID): Promise<T | null> {
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/${this.getEndpoint()}/${String(id)}`,
			)

			if (response.status === 404) {
				return null
			}

			if (!response.ok) {
				throw new Error(`Failed to fetch entity: ${response.statusText}`)
			}

			const resource = (await response.json()) as unknown

			return this.toDomainEntity(resource)
		} catch (error) {
			console.error(`Error fetching ${this.getEndpoint()} with id ${id}:`, error)
			throw error
		}
	}

	/**
	 * Common method to save an entity (create or update)
	 */
	async save(entity: T, id?: ID): Promise<T> {
		try {
			const method = id ? 'PUT' : 'POST'
			const url = id
				? `${this.apiBaseUrl}/${this.getEndpoint()}/${String(id)}`
				: `${this.apiBaseUrl}/${this.getEndpoint()}`

			const resource = this.toResource(entity)

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(resource),
			})

			if (!response.ok) {
				throw new Error(`Failed to save entity: ${response.statusText}`)
			}

			const savedResource = (await response.json()) as unknown

			return this.toDomainEntity(savedResource)
		} catch (error) {
			console.error(`Error saving ${this.getEndpoint()}:`, error)
			throw error
		}
	}

	/**
	 * Common method to delete an entity by ID
	 */
	async delete(id: ID): Promise<boolean> {
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/${this.getEndpoint()}/${String(id)}`,
				{
					method: 'DELETE',
				},
			)

			return response.ok
		} catch (error) {
			console.error(`Error deleting ${this.getEndpoint()} with id ${id}:`, error)
			throw error
		}
	}
}
