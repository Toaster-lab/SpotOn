<script lang="ts">
  import SideNavigation from "./lib/SideNavigation.svelte";
  import Topbar from "./lib/Topbar.svelte";
  import TabWindow from "./lib/Window/TabWindow.svelte";
  import MainWindow from "./lib/MainWindow.svelte";

  let activeTab = $state<"main" | "second">("main");
</script>

<div id="app-container">
  <Topbar bind:activeTab />
  <div id="layout-grid">
    <SideNavigation />
    <div class="tab-panels">
      <div id="panel-main" role="tabpanel" aria-labelledby="tab-main" hidden={activeTab !== "main"} tabindex="0">
        <MainWindow />
      </div>
      <div id="panel-second" role="tabpanel" aria-labelledby="tab-second" hidden={activeTab !== "second"} tabindex="0">
        <TabWindow title="Second Window" />
      </div>
    </div>
  </div>
</div>

<style>
  #layout-grid {
    display: grid;
    grid-template-columns: clamp(220px, 20vw, 280px) minmax(0, 1fr);
    flex: 1;
    width: 100%;
  }

  .tab-panels,
  [role="tabpanel"] {
    min-width: 0;
  }

  #app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  @media (max-width: 900px) {
    #layout-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
