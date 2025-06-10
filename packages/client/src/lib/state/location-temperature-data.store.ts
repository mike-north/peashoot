import { writable, get } from 'svelte/store'
import { LocationTemperatureDataRepository } from '../repositories/location-temperature-data.repository'
import type { Location } from '@peashoot/types'

interface LocationTemperatureDataState {
	locations: Location[]
	selectedLocation: Location | null
	targetTemperature: number | null
	temperatureUnit: 'C' | 'F'
	estimatedDate: Date | null
	isLoading: boolean
	error: string | null
}

function createLocationTemperatureDataStore() {
	const repository = new LocationTemperatureDataRepository()
	const { subscribe, set, update } = writable<LocationTemperatureDataState>({
		locations: [],
		selectedLocation: null,
		targetTemperature: null,
		temperatureUnit: 'C',
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
			update((state) => ({ ...state, selectedLocation: location, estimatedDate: null }))
		},
		setTemperatureUnit: (unit: 'C' | 'F') => {
			update((state) => {
				if (unit === state.temperatureUnit) {
					return state
				}

				if (state.targetTemperature === null) {
					return { ...state, temperatureUnit: unit, estimatedDate: null }
				}

				const currentTemp = state.targetTemperature
				const newTemp =
					unit === 'F'
						? (currentTemp * 9) / 5 + 32 // C to F
						: ((currentTemp - 32) * 5) / 9 // F to C

				return {
					...state,
					temperatureUnit: unit,
					targetTemperature: Math.round(newTemp * 10) / 10,
					estimatedDate: null,
				}
			})
		},
		setTargetTemperature: (temperature: number | null) => {
			update((state) => ({
				...state,
				targetTemperature: temperature,
				estimatedDate: null,
			}))
		},
		calculateDate: async () => {
			const currentState = get(store)
			if (!currentState.selectedLocation || currentState.targetTemperature === null)
				return

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
						unit: currentState.temperatureUnit,
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
				targetTemperature: null,
				temperatureUnit: 'C',
				estimatedDate: null,
				isLoading: false,
				error: null,
			})
		},
	}

	return store
}

export const locationTemperatureDataStore = createLocationTemperatureDataStore()
