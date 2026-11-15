<script lang="ts">
    let { status = "moderate" }: { status?: string } = $props();
</script>

<div class="ai-overview">
    <p class="sample-label">Sample health overview · illustrative data</p>
    <p>Your risk meter currently shows <strong>{status} risk</strong>. In this sample report, a downward iron trend and a change in inflammatory markers are flagged for review against your personal baseline.</p>
    <p>Other tracked blood markers remain within the sample baseline range. Trends are considered alongside mission conditions and, where available, menstrual cycle data to give context to changes over time.</p>
    <p class="anomaly"><strong>Anomaly to review:</strong> the latest inflammatory marker reading differs from the recent trend. Discuss the result with your flight medical team; a single reading does not establish a diagnosis.</p>
</div>

<style>
    .ai-overview { display: grid; gap: 12px; line-height: 1.6; }
    p { margin: 0; }
    .sample-label { font-size: 0.75rem; color: var(--color-text-secondary); }
    .anomaly { border-left: 3px solid var(--color-warning-border); padding: 12px; background: var(--color-warning-background); color: var(--color-warning-text); }
</style>
