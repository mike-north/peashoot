import { mount } from 'svelte'
import './app.scss'
import App from './App.svelte'

const rootElement = document.getElementById('app')
if (!rootElement) throw new Error('No root element')

const app = mount(App, {
	target: rootElement,
})

export default app
