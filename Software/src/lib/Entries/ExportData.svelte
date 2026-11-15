<script lang="ts">
    import { Download } from "@lucide/svelte";
    import type { Entry } from "./entries";
    import { entriesCsv, downloadFile, exportColumns } from "./exportData";
    import fontUrl from "../../assets/fonts/DejaVuSans.ttf?url";

    let { selectedEntries }: { selectedEntries: readonly Entry[] } = $props();
    let fieldIds = $state<string[]>(exportColumns.map(column => column.id));
    let format = $state("csv");
    let busy = $state(false);
    let error = $state("");
    let message = $state("");
    const id = $props.id();
    async function exportData(event: SubmitEvent) {
        event.preventDefault();
        if (busy || !selectedEntries.length || !fieldIds.length) return;
        const snapshot = selectedEntries.map(entry => ({ ...entry, readings: { ...entry.readings } }));
        const selectedFormat = format;
        const fields = [...fieldIds];
        busy = true; error = ""; message = "";
        try {
            let blob: Blob;
            if (selectedFormat === "csv") blob = new Blob([entriesCsv(snapshot, fields)], { type: "text/csv;charset=utf-8" });
            else {
                const [{ createEntriesPdf }, response] = await Promise.all([import("./pdfExport"), fetch(fontUrl)]);
                if (!response.ok) throw new Error("Could not load PDF font");
                const bytes = new Uint8Array(await response.arrayBuffer());
                let binary = "";
                for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
                blob = new Blob([createEntriesPdf(snapshot, btoa(binary), fields)], { type: "application/pdf" });
            }
            downloadFile(blob, `spoton-entries.${selectedFormat}`);
            message = "Download started.";
        } catch { error = "Could not export the data. Your entries are unchanged. Please try again."; }
        finally { busy = false; }
    }
</script>

<form onsubmit={exportData}>
    <fieldset disabled={busy}>
        <legend>What to export</legend>
        <div class="field-list">
            {#each exportColumns as column}
                <label class="field-option"><input type="checkbox" value={column.id} bind:group={fieldIds} onchange={() => { error = ""; message = ""; }} />{column.label}</label>
            {/each}
        </div>
    </fieldset>
    <label for={`${id}-format`}>File format</label>
    <select id={`${id}-format`} bind:value={format} disabled={busy}>
        <option value="csv">CSV · spreadsheet data</option>
        <option value="pdf">PDF · readable report</option>
    </select>
    {#if !fieldIds.length}<p class="hint">Choose at least one field to export.</p>{/if}
    {#if !selectedEntries.length}<p class="hint">No entries available to export.</p>{/if}
    <button type="submit" disabled={busy || !selectedEntries.length || !fieldIds.length}><Download size={18} aria-hidden="true" />{busy ? "Preparing…" : `Export ${format.toUpperCase()}`}</button>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if message}<p class="hint" role="status">{message}</p>{/if}
</form>

<style>
    form { display: flex; flex-direction: column; gap: 12px; font-size: 0.875rem; }
    p { margin: 0; }
    label { font-weight: 500; }
    fieldset { min-width: 0; border: 0; padding: 0; margin: 0; }
    legend { font-weight: 500; margin-bottom: 10px; }
    .field-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .field-option { display: flex; align-items: center; gap: 8px; font-weight: 400; cursor: pointer; }
    input[type="checkbox"] { width: 18px; height: 18px; flex-shrink: 0; margin: 0; accent-color: var(--color-primary); }
    input:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    select { width: 100%; padding: 12px; border: 1px solid var(--color-outline); background: var(--color-surface); color: var(--color-text); font: inherit; }
    button { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 0; background: var(--color-primary); color: var(--color-surface); font: inherit; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: default; }
    button:focus-visible, select:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .hint { color: var(--color-text-secondary); font-size: 0.8rem; }
    .error { color: var(--color-error); }
</style>
