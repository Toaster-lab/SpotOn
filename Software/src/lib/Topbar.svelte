<script lang="ts">
    import { onMount } from "svelte";
    import { Moon, Sun } from "@lucide/svelte";

    let { activeTab = $bindable("main") }: { activeTab?: "main" | "second" } = $props();
    const tabs = [
        { id: "main", label: "Main Window" },
        { id: "second", label: "Second Window" },
    ] as const;

    function handleTabKey(event: KeyboardEvent, index: number) {
        let next: number;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activeTab = tabs[next].id;
        const button = event.currentTarget as HTMLButtonElement;
        button.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    }

    let darkMode = $state(false);

    function applyTheme() {
        document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    }

    onMount(() => {
        let savedTheme: string | null = null;
        try {
            savedTheme = localStorage.getItem("spoton-theme");
        } catch {
            // Theme switching still works when browser storage is unavailable.
        }
        darkMode = savedTheme === "dark" ||
            (savedTheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        applyTheme();
    });

    function toggleTheme() {
        darkMode = !darkMode;
        applyTheme();
        try {
            localStorage.setItem("spoton-theme", darkMode ? "dark" : "light");
        } catch {
            // Keep the selected theme for this visit if storage is unavailable.
        }
    }
</script>

<header class="topbar">
    <div class="logo-placeholder" aria-label="Logo placeholder">Logo</div>
    <div class="tabs" role="tablist" aria-label="Dashboard windows">
        {#each tabs as tab, index}
            <button
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                tabindex={activeTab === tab.id ? 0 : -1}
                onclick={() => activeTab = tab.id}
                onkeydown={(event) => handleTabKey(event, index)}
            >{tab.label}</button>
        {/each}
    </div>
    <button
        class="theme-toggle"
        type="button"
        onclick={toggleTheme}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
        {#if darkMode}
            <Sun size={22} aria-hidden="true" />
        {:else}
            <Moon size={22} aria-hidden="true" />
        {/if}
    </button>
</header>

<style>
    .topbar {
        min-height: 72px;
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 12px 25px;
        background: var(--color-surface);
    }

    .logo-placeholder {
        display: grid;
        flex-shrink: 0;
        width: 110px;
        height: 40px;
        place-items: center;
        border: 1px dashed var(--color-outline);
        border-radius: 6px;
        color: var(--color-text-secondary);
        font-size: 14px;
    }
    .tabs {
        display: flex;
        align-self: stretch;
        min-width: 0;
        overflow-x: auto;
    }

    .tabs button {
        flex-shrink: 0;
        padding: 10px 16px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: var(--color-text-secondary);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
    }

    .tabs button[aria-selected="true"] {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
    }

    .tabs button:hover {
        background: var(--color-primary-hover);
    }

    .tabs button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -4px;
    }

    @media (max-width: 600px) {
        .topbar { flex-wrap: wrap; gap: 12px; }
        .tabs { order: 3; width: 100%; }
    }

    .theme-toggle {
        margin-left: auto;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--color-text);
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .theme-toggle:hover {
        background: var(--color-primary-hover);
    }

    .theme-toggle:active {
        background: var(--color-primary-pressed);
    }

    .theme-toggle:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
</style>
