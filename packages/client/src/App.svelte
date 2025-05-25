<script lang="ts">
  import {
  RouterView,
    type Route,
    type RouterOptions,
  } from "@dvcol/svelte-simple-router";

  import HomeComponent from "./ui/pages/Home.svelte";

  const RouteName = {
    Hello: "hello",
    Goodbye: "goodbye",
    Home: "home",
    Any: "any",
  } as const;

  type RouteNames = (typeof RouteName)[keyof typeof RouteName];

  const routes: Readonly<readonly Route<RouteNames>[]> = [
    {
      name: RouteName.Home,
      path: "/",
      component: HomeComponent,
    },
  ] as const;

  const options: RouterOptions<RouteNames> = {
    routes,
  } as const;
</script>

<RouterView {options} />
