<script lang="ts">
    import { saveEntries } from "./entries";
    import { parseCsv, guessMapping, prepareImport, importFields, type Mapping } from "./csvImport";
    let { onImported }: { onImported: (count: number) => void } = $props();
    let fileInput: HTMLInputElement;
    let source = $state("");
    let filename = $state("");
    let delimiter = $state(",");
    let hasHeader = $state(true);
    let rows = $state<string[][]>([]);
    let mapping = $state<Mapping>({});
    let error = $state("");
    let busy = $state(false);
    const id = $props.id();
    let prepared = $derived(prepareImport(rows, mapping, hasHeader));
    function parse() {
        rows = []; mapping = {}; error = "";
        if (!source) return;
        try { rows = parseCsv(source, delimiter); mapping = hasHeader ? guessMapping(rows[0]) : {}; }
        catch (cause) { error = cause instanceof Error ? cause.message : "Could not read this CSV."; }
    }
    async function chooseFile(event: Event) {
        const file = (event.currentTarget as HTMLInputElement).files?.[0];
        source = ""; rows = []; mapping = {}; error = ""; filename = "";
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { error = "Choose a CSV smaller than 2 MB."; return; }
        busy = true;
        try {
            source = await file.text(); filename = file.name;
            // Detect a common separator using the first complete quoted record.
            let quoted = false, first = "";
            for (const char of source) {
                if (char === '"') quoted = !quoted;
                if (!quoted && (char === "\n" || char === "\r")) break;
                if (!quoted) first += char;
            }
            delimiter = [",", ";", "\t"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
            parse();
        } catch { error = "Could not read the file. Please choose it again."; }
        finally { busy = false; }
    }
    function importData(event: SubmitEvent) {
        event.preventDefault();
        if (busy || !rows.length || prepared.errors.length) return;
        error = "";
        try {
            saveEntries(prepared.entries.map(entry => ({ ...entry, id: crypto.randomUUID() })));
        } catch { error = "Could not save on this device. Nothing was imported. Please try again."; return; }
        onImported(prepared.entries.length);
    }
</script>

<form onsubmit={importData}>
    <p>Choose a CSV, then match its columns to your entry fields. Each data row becomes one entry.</p>
    <span class="file-label" id={`${id}-file-label`}>CSV file</span>
    <div class="file-picker">
        <input bind:this={fileInput} id={`${id}-file`} type="file" accept=".csv,text/csv,text/tab-separated-values" onchange={chooseFile} disabled={busy} hidden />
        <button type="button" class="browse-button" onclick={() => fileInput.click()} disabled={busy} aria-describedby={`${id}-filename`}>Browse…</button>
        <span class="filename" id={`${id}-filename`} role="status">{filename || "No file selected"}</span>
    </div>
    {#if source}
        <div class="options">
            <label>Separator<select bind:value={delimiter} onchange={parse}><option value=",">Comma</option><option value=";">Semicolon</option><option value={"\t"}>Tab</option></select></label>
            <label class="checkbox"><input type="checkbox" bind:checked={hasHeader} onchange={parse} />First row has column names</label>
        </div>
    {/if}
    {#if busy}<p role="status">Reading file…</p>{/if}
    {#if rows.length}
        <p class="hint">Dates: YYYY-MM-DD. Match the units shown below. Leave unneeded fields as “Skip”.</p>
        <div class="mapping">
            {#each importFields as field}
                <label for={`${id}-${field.id}`}>{field.label}{#if field.unit}<span>{field.unit}</span>{/if}</label>
                <select id={`${id}-${field.id}`} value={mapping[field.id] ?? -1} onchange={(event) => { mapping = { ...mapping, [field.id]: Number(event.currentTarget.value) }; error = ""; }}>
                    <option value={-1}>{field.id === "date" ? "Choose column…" : "Skip"}</option>
                    {#each rows[0] as header, index}<option value={index}>Column {index + 1}{hasHeader ? ` · ${header || "Unnamed"}` : ""}</option>{/each}
                </select>
            {/each}
        </div>
        <details>
            <summary>Preview CSV · {filename}</summary>
            <div class="preview"><table><thead><tr>{#each rows[0] as header, index}<th>Column {index + 1}{hasHeader ? ` · ${header}` : ""}</th>{/each}</tr></thead><tbody>
                {#each (hasHeader ? rows.slice(1, 4) : rows.slice(0, 3)) as row}<tr>{#each row as cell}<td>{cell || "—"}</td>{/each}</tr>{/each}
            </tbody></table></div>
        </details>
        {#if prepared.errors.length}
            <div class="validation" role="status"><p>Nothing will be imported until these are fixed.</p><ul>{#each prepared.errors.slice(0, 5) as issue}<li>{issue}</li>{/each}</ul>{#if prepared.errors.length > 5}<p>And {prepared.errors.length - 5} more rows to fix.</p>{/if}</div>
        {:else}
            <p class="hint">{prepared.entries.length} entries ready. These will be added to your existing entries on this device.</p>
        {/if}
        <button type="submit" disabled={busy || prepared.errors.length > 0}>Import {prepared.entries.length} {prepared.entries.length === 1 ? "entry" : "entries"}</button>
    {/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
</form>

<style>
    form { display: flex; flex-direction: column; gap: 12px; font-size: 0.875rem; }
    p { margin: 0; }
    label, .file-label { font-weight: 500; }
    .file-picker { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .browse-button { flex-shrink: 0; }
    .filename { min-width: 0; overflow-wrap: anywhere; color: var(--color-text-secondary); }
    input[hidden] { display: none; }
    input, select { min-width: 0; max-width: 100%; padding: 9px; border: 1px solid var(--color-outline); background: var(--color-surface); color: var(--color-text); font: inherit; }
    .options { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .options label { display: flex; gap: 8px; align-items: center; }
    .checkbox input { margin: 0; }
    .mapping { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: center; }
    .mapping label span { display: block; font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 400; }
    .hint, details { color: var(--color-text-secondary); font-size: 0.8rem; }
    summary { cursor: pointer; }
    .preview { overflow-x: auto; margin-top: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--color-divider); white-space: pre-wrap; overflow-wrap: anywhere; min-width: 90px; max-width: 250px; }
    .validation { background: var(--color-warning-background); color: var(--color-warning-text); padding: 12px; font-size: 0.8rem; }
    ul { margin: 8px 0 0; padding-left: 18px; }
    .error { color: var(--color-error); }
    button { padding: 12px; border: 0; background: var(--color-primary); color: var(--color-surface); font: inherit; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: default; }
    input:focus-visible, select:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
</style>
