import { mount } from 'svelte'

import App from './App.svelte'
import './app.scss'

const rootElement = document.getElementById('app')
if (!rootElement) throw new Error('No root element')

const app = mount(App, {
	target: rootElement,
})

export default app
