<script lang="ts">
    import { Brain, DatabasePlus, Download, Plus } from "@lucide/svelte";
    import { sampleActivity, type RecentActivityItem } from "./activityData";

    let {
        items = sampleActivity,
        onSelect,
    }: {
        items?: RecentActivityItem[];
        onSelect: (item: RecentActivityItem) => void;
    } = $props();

    const icons = {
        chat: Brain,
        upload: DatabasePlus,
        export: Download,
        entry: Plus,
    };
    const id = $props.id();
</script>

<section aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`}>Pick up where you left off</h2>
    <p class="caption">Recent activity · Sample data</p>
    <ul>
        {#each items as item (item.id)}
            {@const Icon = icons[item.type]}
            <li>
                <button
                    type="button"
                    onclick={() => onSelect(item)}
                    title={item.title}
                    aria-label={`Open ${item.type}: ${item.title}`}
                >
                    <span class="icon" aria-hidden="true"
                        ><Icon size={18} strokeWidth={2} /></span
                    >
                    <span class="item-text">
                        <span class="item-title">{item.title}</span>
                        <span class="item-meta"
                            >{item.type} · {item.lastOpened}</span
                        >
                    </span>
                </button>
            </li>
        {:else}
            <li class="empty">Your recent work will appear here.</li>
        {/each}
    </ul>
</section>

<style>
    section {
        margin-top: 28px;
        padding-top: 24px;
        /* additional feature for later use
        border-top: 1px solid var(--color-divider);
        */
    }
    h2 {
        margin: 0;
        padding: 0 12px;
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.5;
    }
    .caption {
        margin: 6px 12px 16px;
        font-size: 0.75rem;
        color: var(--color-text-secondary);
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    button {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 10px 12px;
        border: 0;
        /* border-radius: 8px; */
        background: transparent;
        color: var(--color-text);
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    button:hover {
        background: var(--color-primary-hover);
    }
    button:active {
        background: var(--color-primary-pressed);
    }
    button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
    .icon {
        display: flex;
        flex-shrink: 0;
        color: var(--color-text-secondary);
    }
    .item-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }
    .item-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.4;
    }
    .item-meta {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        text-transform: capitalize;
        line-height: 1.5;
    }
    .empty {
        padding: 12px;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
    }
</style>
