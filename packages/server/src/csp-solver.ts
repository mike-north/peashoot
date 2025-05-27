/* eslint-disable */
// planting-csp-scaffold.ts

import {
	PlantingSolver,
	SpacingConstraintRule,
	AntagonistConstraintRule,
	type Plant,
	type SolverSolution,
	type PlantName,
} from './garden-planner'

// Define the beds
const bedConfigs = [
	{ id: 'bed1', gridSize: 3 },
	{ id: 'bed2', gridSize: 3 },
	{ id: 'bed3', gridSize: 3 },
]

// Define plants using the Plant interface
const plantsData: Plant[] = [
	{
		name: 'arugula',
		minSpacing: 1,
		sunRequirements: 'full',
		companions: ['lettuce'],
		antagonists: ['tomato', 'basil'],
	},
	{
		name: 'lettuce',
		minSpacing: 1,
		sunRequirements: 'partial',
		companions: ['arugula', 'tomato'],
		antagonists: [],
	},
	{
		name: 'tomato',
		minSpacing: 2,
		sunRequirements: 'full',
		companions: ['lettuce'],
		antagonists: ['arugula', 'basil'],
	},
	{
		name: 'basil',
		minSpacing: 1,
		sunRequirements: 'full',
		companions: ['tomato'],
		antagonists: ['arugula'],
	},
	{
		name: 'marigold',
		minSpacing: 1,
		sunRequirements: 'partial',
		companions: ['tomato', 'arugula', 'lettuce'],
		antagonists: [],
	},
]

// Create the solver instance
const solver = new PlantingSolver(bedConfigs, plantsData)

// Register rules with weights
// For hard constraints like spacing and antagonists, we can use a high weight.
const highWeight = 10.0
solver.registerRule(new SpacingConstraintRule(), highWeight)
solver.registerRule(new AntagonistConstraintRule(), highWeight)

// Example: Add a soft rule for companion planting (implementation pending in garden-planner.ts)
// solver.registerRule(new CompanionAffinityRule(), 2.0);

// Solve the CSP
console.log('Attempting to find plant placement solution...')

const startTime1 = performance.now() // Record start time

// We can adjust the satisfactionThreshold (0.0 to 1.0).
// A higher threshold means solutions must satisfy weighted rules more completely.
// Default is 0.75 in the solver.
const solution1: SolverSolution | null = solver.solve(100000, 0.75) // Explicitly using 0.75 for clarity
const endTime1 = performance.now() // Record end time
const elapsedTime1 = (endTime1 - startTime1).toFixed(2) // Calculate elapsed time in milliseconds
console.log(`\nSolver1 finished in ${elapsedTime1} ms.`)

const startTime2 = performance.now() // Record start time
const solution2: SolverSolution | null = solver.solve(100000, 1) // Explicitly using 0.75 for clarity
const endTime2 = performance.now() // Record end time

const elapsedTime2 = (endTime2 - startTime2).toFixed(2) // Calculate elapsed time in milliseconds
console.log(`\nSolver2 finished in ${elapsedTime2} ms.`)

// Output the solution
console.log('\nPlant placement solution:')
if (solution1) {
	bedConfigs.forEach((bedConfig) => {
		console.log(`\n--- ${bedConfig.id.toUpperCase()} ---`)
		const bedSolution = solution1[bedConfig.id]
		if (!bedSolution) {
			console.log(`No solution found for ${bedConfig.id}`)
			return
		}

		// For a nicer table output, we can format it.
		const tableFormattedSolution: any[] = []
		for (let r = 0; r < bedConfig.gridSize; r++) {
			const row: Record<string, PlantName | string> = {} // Allow string for "Empty"
			for (let c = 0; c < bedConfig.gridSize; c++) {
				row[`Col ${c}`] = bedSolution[`${r},${c}`] || 'Empty'
			}
			tableFormattedSolution.push(row)
		}
		console.table(tableFormattedSolution)
	})
} else {
	console.log('No solution1 found for any bed.')
}
if (solution2) {
	bedConfigs.forEach((bedConfig) => {
		console.log(`\n--- ${bedConfig.id.toUpperCase()} ---`)
		const bedSolution = solution2[bedConfig.id]
		if (!bedSolution) {
			console.log(`No solution found for ${bedConfig.id}`)
			return
		}

		// For a nicer table output, we can format it.
		const tableFormattedSolution: any[] = []
		for (let r = 0; r < bedConfig.gridSize; r++) {
			const row: Record<string, PlantName | string> = {} // Allow string for "Empty"
			for (let c = 0; c < bedConfig.gridSize; c++) {
				row[`Col ${c}`] = bedSolution[`${r},${c}`] || 'Empty'
			}
			tableFormattedSolution.push(row)
		}
		console.table(tableFormattedSolution)
	})
} else {
	console.log('No solution2 found for any bed.')
}
