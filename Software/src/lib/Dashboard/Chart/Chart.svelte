<script lang="ts">
    import { entries, entryGraphs } from "../../Entries/entries";
    import { onMount } from "svelte";
    import {
        Chart as ChartJS, LineController, LineElement, PointElement,
        CategoryScale, LinearScale, Tooltip,
    } from "chart.js";
    import { sampleGraphs, type GraphData } from "./graphData";

    ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

    let { graphs = sampleGraphs, dataSourceLabel = "Sample data" }: {
        graphs?: GraphData[];
        dataSourceLabel?: string;
    } = $props();

    let hasReadings = $derived($entries.some(entry => Object.keys(entry.readings).length > 0));
    let displayedGraphs = $derived(hasReadings ? entryGraphs($entries) : graphs);
    let selectedId = $state("");
    let selected = $derived(displayedGraphs.find((graph) => graph.id === selectedId) ?? displayedGraphs[0]);
    let canvas = $state<HTMLCanvasElement>();
    let themeRevision = $state(0);

    onMount(() => {
        const observer = new MutationObserver(() => { themeRevision += 1; });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    });

    $effect(() => {
        themeRevision;
        const graph = selected;
        if (!canvas || !graph?.points.length) return;
        const style = getComputedStyle(document.documentElement);
        const color = (name: string) => style.getPropertyValue(name).trim();
        const text = color("--color-text-secondary");
        const primary = color("--color-primary");
        const font = { family: 'Roboto, "Helvetica Neue", Arial, sans-serif', size: 12 };
        const chart = new ChartJS(canvas, {
            type: "line",
            data: {
                labels: graph.points.map((point) => point.label),
                datasets: [{
                    label: graph.label,
                    data: graph.points.map((point) => point.value),
                    borderColor: primary,
                    backgroundColor: primary,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.25,
                    // Connect recorded readings across entries where this metric was left blank.
                    spanGaps: true,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${graph.label}: ${context.parsed.y ?? "—"} ${graph.unit}`,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: text, font, maxRotation: 0, autoSkip: true },
                        grid: { display: false },
                        border: { color: color("--color-divider") },
                    },
                    y: {
                        title: { display: true, text: graph.unit, color: text, font },
                        ticks: { color: text, font, maxTicksLimit: 6 },
                        grid: { color: color("--color-divider") },
                        border: { display: false },
                        grace: "10%",
                    },
                },
            },
        });
        return () => chart.destroy();
    });
</script>

<div class="container">
    <header>
        <h2>Collected data</h2>
        <span class="source">{hasReadings ? "Your entries" : dataSourceLabel}</span>
    </header>
    <div class="graph-switcher" role="group" aria-label="Select data to display">
        {#each displayedGraphs as graph (graph.id)}
            <button type="button" aria-pressed={selected?.id === graph.id} onclick={() => selectedId = graph.id}>
                {graph.label}
            </button>
        {/each}
    </div>
    {#if selected?.points.some(point => point.value !== null)}
        <h3>{selected.label} <span>({selected.unit})</span></h3>
        <div class="plot" role="img" aria-label={`${selected.label} line chart, in ${selected.unit}. Values are available in the data table below.`}>
            <canvas bind:this={canvas} aria-hidden="true"></canvas>
        </div>
        <details>
            <summary>View data table</summary>
            <div class="table-scroll">
                <table>
                    <thead><tr><th scope="col">Date / time</th><th scope="col">{selected.label} ({selected.unit})</th></tr></thead>
                    <tbody>
                        {#each selected.points as point}
                            <tr><th scope="row">{point.label}</th><td>{point.value ?? "—"}</td></tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </details>
    {:else}
        <p class="empty">No readings available for {selected?.label ?? "this chart"}.</p>
    {/if}
</div>

<style>
    .container {
        min-width: 0;
        width: 100%;
        background: var(--color-surface);
        padding: 24px;
        /* border-radius: 20px; */
    }
    header { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    h2 { margin: 0; }
    .source, h3 span, details, .empty { color: var(--color-text-secondary); font-size: 0.875rem; }
    .graph-switcher { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
    button {
        padding: 8px 12px;
        border: 1px solid var(--color-divider);
        /* border-radius: 8px; */
        background: transparent;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
    }
    button:hover { background: var(--color-primary-hover); }
    button[aria-pressed="true"] { background: var(--color-primary-hover); border-color: var(--color-primary); color: var(--color-primary); }
    button:focus-visible, summary:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    h3 { margin: 0 0 16px; }
    .plot { position: relative; height: clamp(240px, 30vw, 360px); min-width: 0; }
    details { margin-top: 16px; }
    summary { cursor: pointer; width: fit-content; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--color-divider); }
    tbody th { font-weight: 400; }
    @media (max-width: 600px) { .container { padding: 16px; } }
</style>
