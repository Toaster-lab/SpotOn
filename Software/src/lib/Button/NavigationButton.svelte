<script lang="ts">
    import type { Component } from "svelte";

    let {
        icon,
        title = "Sample Button",
        fontSize = "14px",
        strokeWidth = 2,
        onClick = () => {},
    }: {
        icon?: Component<{
            size?: number | string;
            strokeWidth?: number;
        }>;
        title?: string;
        fontSize?: string;
        strokeWidth?: number;
        onClick?: () => void;
    } = $props();
</script>

<div class="navigation-button-container">
    <button onclick={onClick} style:font-size={fontSize}>
        {#if icon}
            {@const Icon = icon}
            <Icon size="1em" {strokeWidth} />
        {/if}

        <span>{title}</span>
    </button>
</div>

<style>
    .navigation-button-container {
        width: 100%;
    }

    button {
        box-sizing: border-box;
        width: 100%;
        min-height: 36px;
        padding: 8px 12px;

        display: flex;
        align-items: center;
        gap: 12px;

        border: 0;
        border-radius: 8px;

        color: var(--color-text-secondary);

        font-family: inherit;
        font-weight: 500;
        line-height: 20px;
        background-color: transparent;

        cursor: pointer;
        transition:
            background-color 0.2s,
            color 0.2s;
    }

    button:hover {
        background-color: var(--color-primary-hover);
        color: var(--color-primary);
    }

    button:active {
        background-color: var(--color-primary-pressed);
        color: var(--color-primary);
    }

    button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 3px;
    }

    button span {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    button :global(svg) {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
    }
</style>
