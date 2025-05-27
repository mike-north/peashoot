import { CSP, min_conflicts } from 'csps'

// ---------------- Interfaces ----------------

export type PlantName = string

export interface Plant {
	name: PlantName
	minSpacing: number
	sunRequirements?: string // e.g., "full", "partial", "shade"
	companions?: PlantName[]
	antagonists?: PlantName[]
	// Add other relevant plant properties here
	[key: string]: any // For additional arbitrary properties
}

export interface CellAddress {
	bedId: string
	row: number
	col: number
}

export type CellId = string // Format: "bedId-row,col"

export interface ConstraintContext {
	plant1: Plant
	plant1CellId: CellId
	plant2: Plant
	plant2CellId: CellId
	allNeighbors: Readonly<Record<CellId, CellId[]>>
	allPlants: Readonly<Record<PlantName, Plant>>
	gridSize: number // Assuming square grid for simplicity in neighbors
}

export interface PlantingRule {
	/**
	 * Calculates a satisfaction score for the placement of plant1 in cell1 and plant2 in cell2
	 * according to this rule.
	 * @returns a score between 0.0 (completely violated) and 1.0 (perfectly satisfied).
	 */
	getScore(context: ConstraintContext): number
	/**
	 * A descriptive name for the rule.
	 */
	readonly ruleName: string
}

export interface SolverSolution {
	[bedId: string]: {
		[cellCoordinates: string]: PlantName // "row,col": "plantName"
	}
}

// ---------------- Main Solver Class ----------------

interface GardenBedConfig {
	id: string
	gridSize: number // e.g., 3 for a 3x3 bed
}

export class PlantingSolver {
	private plants: Record<PlantName, Plant>
	private beds: GardenBedConfig[]
	private rules: { rule: PlantingRule; weight: number }[] = []
	private cells: CellId[] = []
	private cellToBedMap: Map<CellId, string> = new Map()
	private domains: Record<CellId, PlantName[]>
	private neighbors: Record<CellId, CellId[]> = {}
	private cspProblem?: CSP<object>

	constructor(beds: GardenBedConfig[], plants: Plant[]) {
		this.beds = beds
		this.plants = plants.reduce(
			(acc, plant) => {
				acc[plant.name] = plant
				return acc
			},
			{} as Record<PlantName, Plant>,
		)

		this.initializeCellsAndNeighbors()
		this.domains = this.initializeDomains()
	}

	private initializeCellsAndNeighbors(): void {
		this.cells = []
		this.neighbors = {}
		this.cellToBedMap.clear()

		this.beds.forEach((bed) => {
			for (let r = 0; r < bed.gridSize; r++) {
				for (let c = 0; c < bed.gridSize; c++) {
					const cellId = this.formatCellId(bed.id, r, c)
					this.cells.push(cellId)
					this.cellToBedMap.set(cellId, bed.id)
					this.neighbors[cellId] = this.calculateNeighbors(cellId, bed.gridSize)
				}
			}
		})
	}

	private formatCellId(bedId: string, row: number, col: number): CellId {
		return `${bedId}-${row},${col}`
	}

	private parseCellId(cellId: CellId): CellAddress {
		const [bedId, coords] = cellId.split('-')
		const [row, col] = coords.split(',').map(Number)
		return { bedId, row, col }
	}

	private calculateNeighbors(cellId: CellId, gridSize: number): CellId[] {
		const { bedId, row, col } = this.parseCellId(cellId)
		const cellNeighbors: CellId[] = []
		for (let dr = -1; dr <= 1; dr++) {
			for (let dc = -1; dc <= 1; dc++) {
				if (dr === 0 && dc === 0) continue
				const r = row + dr
				const c = col + dc
				if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
					cellNeighbors.push(this.formatCellId(bedId, r, c))
				}
			}
		}
		return cellNeighbors
	}

	private initializeDomains(): Record<CellId, PlantName[]> {
		const plantNames = Object.keys(this.plants)
		const cellDomains: Record<CellId, PlantName[]> = {}
		this.cells.forEach((cell) => {
			cellDomains[cell] = [...plantNames]
		})
		return cellDomains
	}

	public registerRule(rule: PlantingRule, weight: number = 1.0): void {
		if (weight <= 0) {
			console.warn(
				`Rule "${rule.ruleName}" registered with non-positive weight ${weight}. Review if this is intended, as it might lead to unexpected behavior.`,
			)
			// We can decide to throw an error, ignore the rule, or allow it if negative weights have a meaning.
			// For now, let's allow it but warn.
		}
		this.rules.push({ rule, weight })
	}

	private masterConstraint = (
		cell1Id: CellId,
		plant1NameObj: object,
		cell2Id: CellId,
		plant2NameObj: object,
		satisfactionThreshold: number,
	): boolean => {
		const plant1Name = plant1NameObj as unknown as PlantName
		const plant2Name = plant2NameObj as unknown as PlantName

		const plant1 = this.plants[plant1Name]
		const plant2 = this.plants[plant2Name]

		if (!plant1 || !plant2) {
			console.warn(`Plant not found for name: ${plant1Name} or ${plant2Name}`)
			return false
		}

		const context: ConstraintContext = {
			plant1,
			plant1CellId: cell1Id,
			plant2,
			plant2CellId: cell2Id,
			allNeighbors: this.neighbors,
			allPlants: this.plants,
			gridSize: this.beds.find((b) => this.parseCellId(cell1Id).bedId === b.id)!.gridSize,
		}

		let totalWeightedScore = 0
		let sumOfPositiveWeights = 0

		for (const { rule, weight } of this.rules) {
			if (weight > 0) {
				totalWeightedScore += rule.getScore(context) * weight
				sumOfPositiveWeights += weight
			}
			// Optionally, handle weight <= 0 differently if they have a meaning, e.g. penalties
		}

		if (sumOfPositiveWeights === 0) {
			return true // No positive weights, so no rules to satisfy or violate actively.
		}

		const normalizedScore = totalWeightedScore / sumOfPositiveWeights

		return normalizedScore >= satisfactionThreshold
	}

	public solve(
		maxIterations: number = 10000,
		satisfactionThreshold: number = 0.75,
	): SolverSolution | null {
		// CSP library requires the constraint function to have a specific signature.
		// We adapt our masterConstraint using a closure to include the satisfactionThreshold.
		const boundMasterConstraint = (
			cell1Id: CellId,
			plant1NameObj: object,
			cell2Id: CellId,
			plant2NameObj: object,
		): boolean => {
			return this.masterConstraint(
				cell1Id,
				plant1NameObj,
				cell2Id,
				plant2NameObj,
				satisfactionThreshold,
			)
		}

		this.cspProblem = new CSP<object>(
			this.cells,
			this.domains as unknown as Record<CellId, object[]>,
			this.neighbors,
			boundMasterConstraint, // Use the bound version
		)

		const rawSolution = min_conflicts<object>(this.cspProblem, maxIterations)

		if (!rawSolution) {
			return null
		}

		// Format the solution
		const formattedSolution: SolverSolution = {}
		this.beds.forEach((bed) => {
			formattedSolution[bed.id] = {}
		})

		for (const cellId in rawSolution) {
			if (Object.prototype.hasOwnProperty.call(rawSolution, cellId)) {
				const plantName = rawSolution[cellId] as unknown as PlantName
				const { bedId, row, col } = this.parseCellId(cellId)
				formattedSolution[bedId][`${row},${col}`] = plantName
			}
		}
		return formattedSolution
	}
}

// ---------------- Concrete Rule Implementations ----------------

export class SpacingConstraintRule implements PlantingRule {
	public readonly ruleName = 'SpacingConstraint'

	public getScore(context: ConstraintContext): number {
		const { plant1, plant1CellId, plant2, plant2CellId, allNeighbors } = context

		// This rule only applies if the plants are the same type and are neighbors
		if (
			plant1.name === plant2.name &&
			allNeighbors[plant1CellId]?.includes(plant2CellId)
		) {
			if (plant1.minSpacing > 1) {
				return 0.0 // Violation: same plants too close
			}
		}
		return 1.0 // Rule doesn't apply or is satisfied
	}
}

export class AntagonistConstraintRule implements PlantingRule {
	public readonly ruleName = 'AntagonistConstraint'

	public getScore(context: ConstraintContext): number {
		const { plant1, plant2, plant1CellId, plant2CellId, allNeighbors } = context

		// This rule applies if plants are neighbors
		if (allNeighbors[plant1CellId]?.includes(plant2CellId)) {
			if (
				plant1.antagonists?.includes(plant2.name) ||
				plant2.antagonists?.includes(plant1.name)
			) {
				return 0.0 // Violation: antagonists are neighbors
			}
		}
		return 1.0 // Rule doesn't apply or is satisfied
	}
}
