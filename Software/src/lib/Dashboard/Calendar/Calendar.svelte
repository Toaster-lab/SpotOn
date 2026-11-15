<script lang="ts">
    import { ChevronLeft, ChevronRight, TriangleAlert } from "@lucide/svelte";

    // Illustrative history; replace with recorded cycle phases and blood-marker alerts.
    const today = new Date(2026, 10, 15, 12);
    const historyStart = new Date(2026, 9, 1, 12);
    const cycleStart = new Date(2026, 10, 3, 12);
    const phases = ["Period", "Follicular", "Ovulation", "Luteal"] as const;
    let weekStart = $state(new Date(2026, 10, 9, 12));
    let selectedDate = $state(today);

    function key(date: Date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
    function record(date: Date) {
        if (date < historyStart || date > today) return null;
        const elapsed = Math.round((date.getTime() - cycleStart.getTime()) / 86400000);
        const day = ((elapsed % 28) + 28) % 28 + 1;
        return { phase: day <= 5 ? 0 : day <= 13 ? 1 : day <= 15 ? 2 : 3, warning: key(date) === "2026-11-14" };
    }
    let dates = $derived(Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i, 12)));
    let selected = $derived(record(selectedDate));
    let weekEnd = $derived(dates[6]);
    function changeWeek(direction: number) {
        weekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + direction * 7, 12);
    }
</script>

<section class="container" aria-label="Cycle calendar">
    <header>
        <h2>Cycle calendar</h2>
        <p class="phase" aria-live="polite">{selected ? phases[selected.phase] : "Unknown"} phase<span> · {key(selectedDate) === key(today) ? "Today" : selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></p>
    </header>
    <div class="week" aria-label={`Week of ${weekStart.toLocaleDateString("en-GB")}`}>
        <button type="button" class="arrow" aria-label="Previous week" disabled={weekStart <= historyStart} onclick={() => changeWeek(-1)}><ChevronLeft size={18} /></button>
        {#each dates as date}
            {@const entry = record(date)}
            <button type="button" class="day" class:selected={key(date) === key(selectedDate)} disabled={!entry}
                aria-pressed={key(date) === key(selectedDate)} aria-current={key(date) === key(today) ? "date" : undefined}
                aria-label={`${date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}${entry ? `, ${phases[entry.phase]} phase${entry.warning ? ", risk warning" : ""}` : ", no recorded data"}`}
                onclick={() => { selectedDate = date; }}>
                <span class="weekday">{date.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                <span class="number">{date.getDate()}{#if entry?.warning}<TriangleAlert size={10} />{/if}</span>
            </button>
        {/each}
        <button type="button" class="arrow" aria-label="Next week" disabled={weekEnd >= today} onclick={() => changeWeek(1)}><ChevronRight size={18} /></button>
    </div>
    {#if selected?.warning}
        <p class="risk-warning" role="status"><TriangleAlert size={14} /><span>Risk warning: blood marker change flagged for review.</span></p>
    {/if}
</section>

<style>
    .container { min-width: 0; width: 100%; padding: 20px 24px; background: var(--color-surface); /* border-radius: 20px; */ }
    h2, p { margin: 0; }
    .phase { margin-top: 2px; color: var(--color-primary); font-size: 0.8rem; }
    .phase > span { color: var(--color-text-secondary); }
    .week { display: grid; grid-template-columns: 28px repeat(7, minmax(0, 1fr)) 28px; gap: 4px; align-items: center; margin-top: 12px; }
    button { border: 0; background: transparent; color: var(--color-text); font: inherit; cursor: pointer; padding: 0; }
    button:hover:not(:disabled) { background: var(--color-primary-hover); }
    button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }
    button:disabled { opacity: 0.35; cursor: default; }
    .arrow { display: grid; place-items: center; min-height: 44px; }
    .day { min-height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
    .day.selected { background: var(--color-primary-hover); color: var(--color-primary); box-shadow: inset 0 -2px var(--color-primary); }
    .weekday { font-size: 0.65rem; color: var(--color-text-secondary); }
    .number { position: relative; font-size: 0.9rem; }
    .number :global(svg) { position: absolute; top: 0; left: 100%; margin-left: 2px; color: var(--color-warning-dark); }
    .risk-warning { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 8px; font-size: 0.75rem; background: var(--color-warning-background); color: var(--color-warning-text); }
    .risk-warning :global(svg) { flex-shrink: 0; }
    @media (max-width: 600px) { .container { padding: 16px; } .week { gap: 2px; } }
</style>
