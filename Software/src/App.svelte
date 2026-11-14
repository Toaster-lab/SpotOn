<script lang="ts">
  import SideNavigation from "./lib/SideNavigation.svelte";
  import MainWindow from "./lib/MainWindow.svelte";
</script>

<div id="app-container">
  <div id="layout-grid">
    <SideNavigation />
    <MainWindow />
  </div>
</div>

<style>
  #layout-grid {
    display: grid;
    grid-template-areas: side-navigation main-window;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 4fr;
    height: 100vh;
    width: 100%;
  }

  #app-container {
    display: flex;
  }
</style>
