<script lang="ts">
    import { tick } from "svelte";
    import { Check, X } from "@lucide/svelte";
    import { editEntryField, updateEntry, type Entry } from "./entries";
    import { cellValue } from "./entryTable";
    let { entry, column }: { entry: Entry; column: { id: string; label: string; unit: string } } = $props();
    let editing = $state(false);
    let draft = $state("");
    let error = $state("");
    let editor = $state<HTMLInputElement | HTMLTextAreaElement>();
    const id = $props.id();
    async function start() {
        draft = String(cellValue(entry, column.id) ?? "");
        error = "";
        editing = true;
        await tick();
        editor?.focus();
    }
    function save(event: SubmitEvent) {
        event.preventDefault();
        error = "";
        let updated: Entry;
        try { updated = editEntryField(entry, column.id, draft); }
        catch (cause) { error = cause instanceof Error ? cause.message : "Please check this value."; return; }
        try { updateEntry(updated); }
        catch { error = "Could not save. Your entry is unchanged. Please try again."; return; }
        editing = false;
    }
    function keyboard(event: KeyboardEvent) {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); editing = false; }
        else if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            (event.currentTarget as HTMLElement).closest("form")?.requestSubmit();
        }
    }
</script>

{#if editing}
    <form onsubmit={save}>
        {#if column.id === "notes"}
            <textarea bind:this={editor} aria-label={`Edit ${column.label}`} aria-describedby={`${id}-hint`} aria-invalid={!!error} value={draft} oninput={(event) => { draft = event.currentTarget.value; }} onkeydown={keyboard} rows="3"></textarea>
        {:else}
            <input bind:this={editor} aria-label={`Edit ${column.label}${column.unit ? ` (${column.unit})` : ""}`} aria-describedby={`${id}-hint`} aria-invalid={!!error} type={column.id === "date" ? "date" : "number"} required={column.id === "date"} min={column.id === "date" ? undefined : "0"} step="any" value={draft} oninput={(event) => { draft = event.currentTarget.value; }} onkeydown={keyboard} />
        {/if}
        <div class="actions">
            <button type="submit" aria-label="Save change" title="Save change"><Check size={16} /></button>
            <button type="button" aria-label="Cancel edit" title="Cancel edit" onclick={() => { editing = false; }}><X size={16} /></button>
        </div>
        <span id={`${id}-hint`} class="hint">Enter to save · Esc to cancel{column.id === "notes" ? " · Shift+Enter for a new line" : ""}</span>
        {#if error}<p class="error" role="alert">{error}</p>{/if}
    </form>
{:else}
    <button type="button" class="cell-value" onclick={start} title={`Edit ${column.label}`} aria-label={`Edit ${column.label}: ${cellValue(entry, column.id) ?? "empty"}`}>{cellValue(entry, column.id) ?? "—"}</button>
{/if}

<style>
    .cell-value { width: 100%; min-height: 28px; display: block; padding: 2px 4px; margin: -2px -4px; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; cursor: text; }
    .cell-value:hover { background: var(--color-primary-hover); box-shadow: inset 0 -1px var(--color-primary); }
    form { display: grid; gap: 6px; min-width: 120px; }
    input, textarea { width: 100%; min-width: 0; padding: 6px; border: 1px solid var(--color-outline); background: var(--color-surface); color: var(--color-text); font: inherit; }
    textarea { resize: vertical; }
    .actions { display: flex; gap: 6px; }
    .actions button { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid var(--color-outline); color: var(--color-primary); background: var(--color-surface); cursor: pointer; }
    button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .hint { font-size: 0.7rem; color: var(--color-text-secondary); }
    .error { margin: 0; font-size: 0.75rem; color: var(--color-error); }
</style>
