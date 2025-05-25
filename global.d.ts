/* eslint-disable @typescript-eslint/no-explicit-any */
// packages/client/src/svelte.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component } from "svelte";
declare module "*.svelte" {
  export default class SvelteComponentTyped<
    Props = Record<string, any>,
    Events = Record<string, any>,
    Slots = Record<string, any>,
  > extends Component<Props, Events, Slots> {}
}
