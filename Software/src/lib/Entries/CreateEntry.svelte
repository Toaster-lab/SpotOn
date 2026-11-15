<script lang="ts">
    import { metrics, saveEntry, validDate } from "./entries";
    let { onSaved }: { onSaved: () => void } = $props();
    let date = $state("");
    let readings = $state<Record<string, number | undefined>>({});
    let notes = $state("");
    let error = $state("");
    const id = $props.id();

    function save(event: SubmitEvent) {
        event.preventDefault();
        error = "";
        const values = Object.fromEntries(Object.entries(readings).filter(([, value]) => value !== undefined)) as Record<string, number>;
        if (!Object.keys(values).length && !notes.trim()) {
            error = "Add at least one blood cell reading or a note.";
            return;
        }
        const entryDate = date;
        if (!validDate(entryDate)) { error = "Choose a valid date."; return; }
        if (Object.values(values).some(value => !Number.isFinite(value) || value < 0)) {
            error = "Use a number of zero or more for each reading.";
            return;
        }
        try {
            saveEntry({ id: crypto.randomUUID(), date: entryDate, readings: values, notes: notes.trim() });
        } catch {
            error = "Could not save on this device. Your input is still here. Please try again.";
            return;
        }
        onSaved();
    }
</script>

<form onsubmit={save}>
    <p class="help">Add a reading or a note. Leave anything you haven’t measured blank.</p>
    <label for={`${id}-date`}>Date <span>(required)</span></label>
    <input id={`${id}-date`} type="date" required bind:value={date} />
    <fieldset>
        <legend>Blood cell readings <span>(optional)</span></legend>
        <div class="readings">
            {#each metrics as metric}
                <label for={`${id}-${metric.id}`}>{metric.label} <span>{metric.unit}</span>
                    <input id={`${id}-${metric.id}`} type="number" min="0" step="any" placeholder="Not measured" bind:value={readings[metric.id]} />
                </label>
            {/each}
        </div>
    </fieldset>
    <label for={`${id}-notes`}>Notes <span>(optional)</span></label>
    <textarea id={`${id}-notes`} rows="3" placeholder="How are you feeling? Anything to remember?" bind:value={notes}></textarea>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <p class="help">Saved on this device. Blood cell readings appear in Collected data.</p>
    <button type="submit">Save entry</button>
</form>

<style>
    form { display: flex; flex-direction: column; gap: 10px; }
    p { margin: 0; }
    .help, label span, legend span { color: var(--color-text-secondary); font-size: 0.8rem; font-weight: 400; }
    label, legend { font-size: 0.875rem; font-weight: 500; }
    fieldset { border: 0; padding: 0; margin: 8px 0; min-width: 0; }
    legend { margin-bottom: 12px; }
    .readings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .readings label { display: flex; flex-direction: column; gap: 4px; }
    input, textarea { width: 100%; min-width: 0; border: 1px solid var(--color-outline); background: var(--color-surface); color: var(--color-text); font: inherit; padding: 10px; }
    textarea { resize: vertical; }
    button { padding: 12px; border: 0; background: var(--color-primary); color: var(--color-surface); font: inherit; cursor: pointer; }
    input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    .error { color: var(--color-error); font-size: 0.875rem; }
    @media (max-width: 400px) { .readings { grid-template-columns: minmax(0, 1fr); } }
</style>
