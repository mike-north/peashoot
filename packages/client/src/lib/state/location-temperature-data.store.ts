import { writable, get } from 'svelte/store'
import { LocationTemperatureDataRepository } from '../repositories/location-temperature-data.repository'
import type { Location } from '../entities/location'

interface LocationTemperatureDataState {
	locations: Location[]
	selectedLocation: Location | null
	targetTemperature: number
	estimatedDate: Date | null
	isLoading: boolean
	error: string | null
}

function createLocationTemperatureDataStore() {
	const repository = new LocationTemperatureDataRepository()
	const { subscribe, set, update } = writable<LocationTemperatureDataState>({
		locations: [],
		selectedLocation: null,
		targetTemperature: 0,
		estimatedDate: null,
		isLoading: false,
		error: null,
	})

	const store = {
		subscribe,
		loadLocations: async () => {
			update((state) => ({ ...state, isLoading: true, error: null }))
			try {
				const locations = await repository.getLocations()
				update((state) => ({ ...state, locations, isLoading: false }))
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to load locations'
				update((state) => ({
					...state,
					isLoading: false,
					error: errorMessage,
				}))
			}
		},
		selectLocation: (location: Location | null) => {
			update((state) => ({ ...state, selectedLocation: location }))
		},
		setTargetTemperature: (temperature: number) => {
			update((state) => ({ ...state, targetTemperature: temperature }))
		},
		calculateDate: async () => {
			const currentState = get(store)
			if (!currentState.selectedLocation || !currentState.targetTemperature) return

			update((state) => ({
				...state,
				isLoading: true,
				error: null,
				estimatedDate: null,
			}))

			try {
				const date = await repository.calculateDate({
					locationId: currentState.selectedLocation.id,
					temperature: {
						value: currentState.targetTemperature,
						unit: 'C',
					},
				})
				update((state) => ({ ...state, estimatedDate: date, isLoading: false }))
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to calculate date'
				update((state) => ({
					...state,
					isLoading: false,
					error: errorMessage,
				}))
			}
		},
		reset: () => {
			set({
				locations: [],
				selectedLocation: null,
				targetTemperature: 0,
				estimatedDate: null,
				isLoading: false,
				error: null,
			})
		},
	}

	return store
}

export const locationTemperatureDataStore = createLocationTemperatureDataStore()
