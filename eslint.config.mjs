import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { TSESLint } from '@typescript-eslint/utils'
import svelte from 'eslint-plugin-svelte'
import n from 'eslint-plugin-n'
import svelteConfig from './packages/client/svelte.config.js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/** @type {TSESLint.FlatConfig.Config} */
const tsRules = {
	'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
	'@typescript-eslint/restrict-template-expressions': [
		'error',
		{
			allowNumber: true,
			allowBoolean: true,
		},
	],
	'@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
	'prettier/prettier': ['warn'],
}

export default tseslint.config(
	{
		ignores: [
			'node_modules/',
			'dist/',
			'build/',
			'coverage/',
			'**/dist/',
			'**/build/',
			'**/coverage/',
			'*.js',
			'*.cjs',
			'*.mjs',
			'eslint.config.*',
			'**/eslint.config.*',
			'**/svelte.config.js',
			'**/vite.config.js',
		],
	},
	js.configs.recommended,
	eslintPluginPrettierRecommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylistic,
	...svelte.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	// Svelte linting for client/src only
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		// See more details at: https://typescript-eslint.io/packages/parser/
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
				parser: tseslint.parser,
				svelteConfig,
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				requestAnimationFrame: 'readonly',
			},
		},

		rules: {
			...tsRules,
		},
	},

	// TypeScript linting for all .ts/.tsx files
	{
		files: ['**/src/**/*.ts', '**/src/**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.json', './packages/server/tsconfig.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			...tsRules,
		},
	},
	{
		files: ['packages/server/**/*.ts'],
		plugins: { n },
	},
	{
		files: ['**/*.cjs'],
		languageOptions: {
			globals: {
				module: 'readonly',
				require: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
)
