import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import Icons from 'unplugin-icons/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		Icons({
			compiler: 'svelte',
		}),
	],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src/assets'),
			'@': path.resolve(__dirname, 'src'),
		},
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.svelte'],
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.js'],
		browser: {
			enabled: true,
			provider: 'playwright',
			instances: [
				{
					browser: 'chromium',
				},
			],
		},
		include: ['./tests/svelte/**/*.test.ts', './tests/unit/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
	},
})
