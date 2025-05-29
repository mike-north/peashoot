import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import * as path from 'path'
import Icons from 'unplugin-icons/vite'

// https://vite.dev/config/
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
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.js'],
	},
})
