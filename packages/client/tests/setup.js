// Setup file for tests
import { vi } from 'vitest'

// Mock window.matchMedia
// eslint-disable-next-line no-undef
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Add any other global mocks or setup here
