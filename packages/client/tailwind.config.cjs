/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const { fontFamily } = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}', './public/index.html'],
	theme: {
		extend: {
			colors: {
				'custom-sidebar-green': 'rgb(231, 240, 225)',
				'lettuce-green': '#e6f3dc',
				'radish-red': '#eb464d',
				'spinach-green': '#206020',
				'jalapeno-green': '#528540',
			},
			fontFamily: {
				sans: ['Inter var', ...fontFamily.sans],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('daisyui'),
		plugin(function ({ addBase }) {
			addBase({
				':root': {
					'--spacing': '1rem',
					'--radius-box': '0.25rem',
					'--radius-btn': '0.25rem',
					'--radius-badge': '0.25rem',
					'--layout-content-width': '1280px',
					'--layout-sidebar-width': '16rem',
					'--color-lettuce-green': '230 243 220',
					'--color-radish-red': '235 70 77',
					'--color-spinach-green': '32 96 32',
					'--color-jalapeno-green': '82 133 64',
				},
			})
		}),
	],
	daisyui: {
		logs: false,
	},
}
