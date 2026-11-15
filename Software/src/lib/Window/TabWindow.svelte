<script lang="ts">
    import type { Snippet } from "svelte";

    let { title = "Window", children }: { title?: string; children?: Snippet } = $props();
</script>

<div class="tab-window">
    {#if title}<h2>{title}</h2>{/if}
    {@render children?.()}
</div>

<style>
    .tab-window {
        min-width: 0;
        min-height: calc(100vh - 72px);
        padding: 24px;
        /* border-top-left-radius: 28px; */
        background: var(--color-background);
        color: var(--color-text);
        overflow-wrap: anywhere;
    }

    h2 { margin: 0 0 24px; }

    @media (max-width: 600px) {
        .tab-window { padding: 16px; /* border-top-left-radius: 20px; */ }
    }
</style>
