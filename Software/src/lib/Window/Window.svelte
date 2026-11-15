<script lang="ts">
    import type { Snippet } from "svelte";
    import { X } from "@lucide/svelte";

    let {
        open = $bindable(false),
        title = "Window",
        children,
    }: {
        open?: boolean;
        title?: string;
        children?: Snippet;
    } = $props();

    const id = $props.id();
    let dialog = $state<HTMLDialogElement>();

    $effect(() => {
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    });

    let pointerStartedOutside = false;

    function isOutside(event: PointerEvent | MouseEvent) {
        if (!dialog || event.target !== dialog) return false;
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom;
    }

    function close() {
        open = false;
    }
</script>

<dialog
    bind:this={dialog}
    aria-labelledby={`${id}-title`}
    onpointerdown={(event) => {
        pointerStartedOutside = isOutside(event);
    }}
    onpointercancel={() => { pointerStartedOutside = false; }}
    onclick={(event) => {
        if (pointerStartedOutside && isOutside(event)) close();
        pointerStartedOutside = false;
    }}
    oncancel={(event) => {
        event.preventDefault();
        close();
    }}
    onclose={() => {
        if (!dialog?.open) close();
    }}
>
    <div class="window-layout">
        <header>
            <h2 id={`${id}-title`}>{title}</h2>
            <button type="button" class="close-button" onclick={close} aria-label="Close window" title="Close window">
                <X size={22} aria-hidden="true" />
            </button>
        </header>
        <div class="content">
            {@render children?.()}
        </div>
    </div>
</dialog>

<style>
    dialog {
        width: min(560px, calc(100vw - 32px));
        max-width: none;
        max-height: calc(100dvh - 32px);
        margin: auto;
        padding: 0;
        border: 0;
        /* border-radius: 20px; */
        background: var(--color-surface);
        color: var(--color-text);
        box-shadow: 0 16px 48px rgb(0 0 0 / 28%);
        overflow: hidden;
    }

    dialog[open] {
        display: flex;
    }

    dialog::backdrop {
        background: rgb(0 0 0 / 55%);
    }

    .window-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        max-height: calc(100dvh - 32px);
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 16px 16px 24px;
        border-bottom: 1px solid var(--color-divider);
    }

    h2 {
        margin: 0;
        overflow-wrap: anywhere;
    }

    .close-button {
        display: grid;
        place-items: center;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        padding: 0;
        border: 0;
        /* border-radius: 50%; */
        background: transparent;
        color: var(--color-text-secondary);
        cursor: pointer;
    }

    .close-button:hover {
        background: var(--color-primary-hover);
        color: var(--color-primary);
    }

    .close-button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .content {
        padding: 24px;
        overflow-y: auto;
        overflow-wrap: anywhere;
    }
</style>
