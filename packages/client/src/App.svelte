<script lang="ts">
  import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";

  import HomeComponent from "./ui/pages/Home.svelte";
  import About from "./ui/components/About.svelte";

  const routes: RouteConfig[] = [
    {
      component: HomeComponent
    },
    {
      path: "about",
      component: About
    }

  ];
</script>


<Router {routes} />
