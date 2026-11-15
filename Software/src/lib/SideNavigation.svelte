<script lang="ts">
    let { createEntryOpen = $bindable(false) }: { createEntryOpen?: boolean } = $props();
    import { onMount } from "svelte";
    import ExportData from "./Entries/ExportData.svelte";
    import UploadData from "./Entries/UploadData.svelte";
    import CreateEntry from "./Entries/CreateEntry.svelte";
    import { entries, loadEntries } from "./Entries/entries";
    let storageError = $state(false);
    let savedMessage = $state("");
    onMount(() => {
        try { loadEntries(); } catch { storageError = true; }
    });
    function entrySaved() {
        createEntryOpen = false;
        savedMessage = "Entry saved on this device.";
    }

    // additional feature for later use
    // import RecentActivity from "./RecentActivity/RecentActivity.svelte";
    import type { RecentActivityItem } from "./RecentActivity/activityData";
    import Window from "./Window/Window.svelte";
    import NavigationButton from "./Button/NavigationButton.svelte";
    import { Plus, DatabasePlus, Download } from "@lucide/svelte";

    let windowOpen = $state(false);
    let windowTitle = $state("Create Entry");

    let selectedActivity = $state<RecentActivityItem | null>(null);

    /* additional feature for later use
    function openActivity(item: RecentActivityItem) {
        selectedActivity = item;
        windowTitle = item.title;
        windowOpen = true;
    }
    */

    function openWindow(title: string) {
        savedMessage = "";
        selectedActivity = null;
        windowTitle = title;
        windowOpen = true;
    }
</script>

<div class="container">
    <div class="list">
        <NavigationButton title="Create Entry" icon={Plus} onClick={() => { savedMessage = ""; createEntryOpen = true; }} />
        <NavigationButton title="Upload Data" icon={DatabasePlus} onClick={() => openWindow("Upload Data")} />
        <NavigationButton title="Export Data" icon={Download} onClick={() => openWindow("Export Data")} />
    </div>
    {#if savedMessage}<p role="status">{savedMessage}</p>{/if}
    <!-- additional feature for later use
    <RecentActivity onSelect={openActivity} />
    -->
</div>

<Window bind:open={createEntryOpen} title="Create Entry">
    {#if createEntryOpen}
        {#if storageError}
            <p role="alert">Saved entries could not be loaded. Please check browser storage and reload before adding an entry.</p>
        {:else}
            <CreateEntry onSaved={entrySaved} />
        {/if}
    {/if}
</Window>

<Window bind:open={windowOpen} title={windowTitle}>
    {#if windowTitle === "Upload Data" && windowOpen}
        {#if storageError}
            <p role="alert">Saved entries could not be loaded. Please check browser storage and reload before importing.</p>
        {:else}
            <UploadData onImported={(count) => { windowOpen = false; savedMessage = ""; window.alert(`${count} ${count === 1 ? "entry" : "entries"} imported successfully.`); }} />
        {/if}
    {:else if windowTitle === "Export Data" && windowOpen}
        {#if storageError}
            <p role="alert">Saved entries could not be loaded. Please reload before exporting.</p>
        {:else}
            <ExportData selectedEntries={$entries} />
        {/if}
    {:else if selectedActivity}
        <p class="activity-description">{selectedActivity.description}</p>
        <p class="activity-content">{selectedActivity.content}</p>
    {/if}
</Window>

<style>
    .container {
        min-width: 0;
        padding: 25px;
    }

    .activity-description {
        margin: 0 0 16px;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
    }

    .activity-content {
        margin: 0;
        white-space: pre-line;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
</style>
