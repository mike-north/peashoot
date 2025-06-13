import { Component } from 'svelte'
declare module '*.svelte' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export default interface SvelteComponentTyped<
		/* eslint-disable @typescript-eslint/no-explicit-any */
		Props extends Record<string, any> = Record<string, any>,
		/* eslint-disable @typescript-eslint/no-explicit-any */
		Events extends Record<string, any> = Record<string, any>,
		Bindings extends keyof Props | '' = string,
	> extends Component<Props, Events, Bindings> {}
}

declare global {
	interface ErrorConstructor {
		captureStackTrace: (targetObject: object, constructorOpt?: Function) => void
	}
}
