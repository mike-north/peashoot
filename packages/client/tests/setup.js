// Setup file for tests
import { vi, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/svelte'

// Clean up after each test
afterEach(() => {
	cleanup()
})

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
}))

// Configure browser environment
if (typeof globalThis.window !== 'undefined') {
	globalThis.window.matchMedia = mockMatchMedia
} else {
	globalThis.matchMedia = mockMatchMedia
}

// Add any other global mocks or setup here
