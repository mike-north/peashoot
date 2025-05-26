import * as path from 'path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src/assets'),
		},
	},
})
