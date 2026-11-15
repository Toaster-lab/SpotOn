<script lang="ts">
    import ExportData from "./ExportData.svelte";
    import type { Entry } from "./entries";
    import EditableCell from "./EditableCell.svelte";
    import Window from "../Window/Window.svelte";
    import { ArrowUp, ArrowDown, ArrowUpDown, Trash2, Download } from "@lucide/svelte";
    // Feature for potential future use
    // let { onCreateEntry }: { onCreateEntry: () => void } = $props();
    // import { Plus } from "@lucide/svelte";
    import { entries, deleteEntries } from "./entries";
    import { entryColumns, filterAndSortEntries } from "./entryTable";
    let exportOpen = $state(false);
    let exportSelection = $state<Entry[]>([]);
    function exportSelected() {
        exportSelection = selectedRows.map(entry => ({ ...entry, readings: { ...entry.readings } }));
        if (exportSelection.length) exportOpen = true;
    }
    let confirmOpen = $state(false);
    let pendingIds = $state<string[]>([]);
    let deleteError = $state("");
    function requestDeletion() {
        pendingIds = selectedRows.map(entry => entry.id);
        deleteError = "";
        if (pendingIds.length) confirmOpen = true;
    }
    let selectedIds = $state<string[]>([]);
    let error = $state("");
    let message = $state("");
    function toggle(id: string, checked: boolean) {
        selectedIds = checked ? [...selectedIds, id] : selectedIds.filter(value => value !== id);
        error = ""; message = "";
    }
    function removeSelected() {
        const ids = pendingIds;
        if (!ids.length) return;
        deleteError = ""; message = "";
        try { deleteEntries(ids); }
        catch { deleteError = "Could not delete on this device. Your entries are unchanged. Please try again."; return; }
        confirmOpen = false;
        pendingIds = [];
        selectedIds = [];
        message = `${ids.length} ${ids.length === 1 ? "entry" : "entries"} deleted.`;
    }
    let query = $state("");
    let sortColumn = $state("date");
    let ascending = $state(true);
    let rows = $derived(filterAndSortEntries($entries, query, sortColumn, ascending));
    let selectedRows = $derived(rows.filter(entry => selectedIds.includes(entry.id)));
    const id = $props.id();
    function sort(column: string) {
        ascending = column === sortColumn ? !ascending : true;
        sortColumn = column;
    }
</script>

<section aria-label="Created entries">
    <div class="toolbar">
        <div class="search-field">
            <label for={`${id}-search`}>Search entries</label>
            <input id={`${id}-search`} type="search" placeholder="Search dates, readings or notes…" bind:value={query} oninput={() => { selectedIds = []; error = ""; message = ""; }} />
        </div>
        <!-- Feature for potential future use
        <button type="button" class="create-entry" onclick={onCreateEntry}><Plus size={20} aria-hidden="true" />Create Entry</button>
        -->
    </div>
    {#if selectedRows.length}
        <div class="selection-actions">
            <span>{selectedRows.length} selected</span>
            <button type="button" class="export-selected" onclick={exportSelected}><Download size={16} aria-hidden="true" />Export selected</button>
            <button type="button" class="delete-entry" onclick={requestDeletion}><Trash2 size={16} aria-hidden="true" />Delete selected</button>
        </div>
    {/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if message}<p class="count" role="status">{message}</p>{/if}
    <p class="count">Click a value to edit it.</p>
    <!-- Keyboard focus allows horizontal scrolling on smaller screens. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="table-scroll" role="region" aria-label="Entries table" tabindex="0">
        <table>
            <caption class="sr-only">Created entries. Select a column heading to sort. A dash means no value was recorded.</caption>
            <thead>
                <tr>
                    <th scope="col" class="select-column"><input type="checkbox" aria-label="Select all visible entries" checked={rows.length > 0 && selectedRows.length === rows.length} indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length} disabled={!rows.length} onchange={(event) => { selectedIds = event.currentTarget.checked ? rows.map(entry => entry.id) : []; error = ""; message = ""; }} /></th>
                    {#each entryColumns as column}
                        <th scope="col" aria-sort={sortColumn === column.id ? (ascending ? "ascending" : "descending") : "none"}>
                            <button type="button" onclick={() => sort(column.id)} aria-label={`Sort by ${column.label}, ${sortColumn === column.id && ascending ? "descending" : "ascending"}`}>
                                <span class="column-heading">{column.label}<span class="sort-arrow" aria-hidden="true">
                                    {#if sortColumn !== column.id}<ArrowUpDown size={16} strokeWidth={2} />
                                    {:else if ascending}<ArrowUp size={16} strokeWidth={2} />
                                    {:else}<ArrowDown size={16} strokeWidth={2} />{/if}
                                </span></span>
                                {#if column.unit}<span class="unit">{column.unit}</span>{/if}
                            </button>
                        </th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each rows as entry (entry.id)}
                    <tr class:selected={selectedIds.includes(entry.id)}>
                        <td class="select-column"><input type="checkbox" aria-label={`Select entry dated ${entry.date}, row ${rows.indexOf(entry) + 1}`} checked={selectedIds.includes(entry.id)} onchange={(event) => toggle(entry.id, event.currentTarget.checked)} /></td>
                        {#each entryColumns as column}
                            <td class:notes={column.id === "notes"} class:date={column.id === "date"}><EditableCell {entry} {column} /></td>
                        {/each}
                    </tr>
                {:else}
                    <tr><td colspan={entryColumns.length + 1} class="empty">{$entries.length ? "No entries match your search." : "No entries yet."}</td></tr>
                {/each}
            </tbody>
        </table>
    </div>
    <p class="count" role="status">{rows.length} of {$entries.length} entries</p>
</section>

<Window bind:open={exportOpen} title="Export Data">
    {#if exportOpen}<ExportData selectedEntries={exportSelection} />{/if}
</Window>

<Window bind:open={confirmOpen} title="Delete entries?">
    <p>Delete {pendingIds.length} selected {pendingIds.length === 1 ? "entry" : "entries"}? This cannot be undone.</p>
    {#if deleteError}<p class="error" role="alert">{deleteError}</p>{/if}
    <div class="confirmation-actions">
        <button type="button" class="cancel-delete" onclick={() => { confirmOpen = false; }}>Cancel</button>
        <button type="button" class="delete-entry" onclick={removeSelected}><Trash2 size={16} aria-hidden="true" />Delete {pendingIds.length === 1 ? "entry" : "entries"}</button>
    </div>
</Window>

<style>
    .confirmation-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .cancel-delete { padding: 10px 12px; border: 1px solid var(--color-outline); background: var(--color-surface); color: var(--color-text); font: inherit; cursor: pointer; }
    section { padding: 24px; background: var(--color-surface); min-width: 0; }
    label { display: block; margin-bottom: 8px; font-size: 0.875rem; font-weight: 500; }
    input { width: 100%; padding: 12px; border: 1px solid var(--color-outline); background: var(--color-surface); color: var(--color-text); font: inherit; }
    .select-column { width: 44px; vertical-align: middle; }
    input[type="checkbox"] { width: 18px; height: 18px; padding: 0; margin: 0; accent-color: var(--color-primary); cursor: pointer; }
    tr.selected { background: var(--color-primary-hover); }
    .selection-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 16px; font-size: 0.875rem; }
    .export-selected { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); font: inherit; cursor: pointer; }
    .delete-entry { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: transparent; color: var(--color-error); border: 1px solid var(--color-error); font: inherit; cursor: pointer; }
    .error { color: var(--color-error); font-size: 0.875rem; }
    .table-scroll { overflow-x: auto; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { padding: 12px; border-bottom: 1px solid var(--color-divider); text-align: left; vertical-align: top; }
    th { font-weight: 500; }
    th button { display: block; min-width: 85px; padding: 0; border: 0; background: transparent; color: var(--color-text); text-align: left; font: inherit; cursor: pointer; }
    .unit { display: block; color: var(--color-text-secondary); font-size: 0.75rem; font-weight: 400; }
    .column-heading { display: flex; align-items: center; gap: 6px; }
    .sort-arrow { display: flex; flex-shrink: 0; color: var(--color-primary); }
    .toolbar { display: flex; align-items: flex-end; gap: 12px; }
    .search-field { flex: 1; min-width: 0; }
    /* Feature for potential future use
    .create-entry { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 12px 16px; border: 0; background: var(--color-primary); color: var(--color-surface); font: inherit; white-space: nowrap; cursor: pointer; }
    */
    @media (max-width: 440px) { .toolbar { flex-wrap: wrap; } .search-field { flex-basis: 100%; } }
    .notes { min-width: 180px; max-width: 340px; white-space: pre-wrap; overflow-wrap: anywhere; }
    .date { white-space: nowrap; }
    .empty, .count { color: var(--color-text-secondary); }
    .empty { padding: 24px 12px; }
    .count { margin: 12px 0 0; font-size: 0.75rem; }
    input:focus-visible, button:focus-visible, .table-scroll:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    @media (max-width: 600px) { section { padding: 16px; } }
</style>
