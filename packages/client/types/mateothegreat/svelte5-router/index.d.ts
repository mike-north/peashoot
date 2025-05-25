import { type Component } from "svelte";
import type { RouterInstanceConfig } from "./router-instance-config";
import type { RouterInstance } from "./router-instance.svelte";

type $$ComponentProps = {
    instance?: RouterInstance;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
} & RouterInstanceConfig;
export const Router: Component<$$ComponentProps, object, "instance">;
export type Router = ReturnType<typeof Router>;
export default Router;
export type { RouteConfig } from "./route.svelte";