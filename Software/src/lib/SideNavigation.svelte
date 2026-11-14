<script lang="ts">
    import RecentActivity from "./RecentActivity/RecentActivity.svelte";
    import type { RecentActivityItem } from "./RecentActivity/activityData";
    import Window from "./Window/Window.svelte";
    import NavigationButton from "./Button/NavigationButton.svelte";
    import { Plus, DatabasePlus, Download } from "@lucide/svelte";

    let windowOpen = $state(false);
    let windowTitle = $state("Create Entry");

    let selectedActivity = $state<RecentActivityItem | null>(null);

    function openActivity(item: RecentActivityItem) {
        selectedActivity = item;
        windowTitle = item.title;
        windowOpen = true;
    }

    function openWindow(title: string) {
        selectedActivity = null;
        windowTitle = title;
        windowOpen = true;
    }
</script>

<div class="container">
    <div class="list">
        <NavigationButton title="Create Entry" icon={Plus} onClick={() => openWindow("Create Entry")} />
        <NavigationButton title="Upload Data" icon={DatabasePlus} onClick={() => openWindow("Upload Data")} />
        <NavigationButton title="Export Data" icon={Download} onClick={() => openWindow("Export Data")} />
    </div>
    <RecentActivity onSelect={openActivity} />
</div>

<Window bind:open={windowOpen} title={windowTitle}>
    {#if selectedActivity}
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
