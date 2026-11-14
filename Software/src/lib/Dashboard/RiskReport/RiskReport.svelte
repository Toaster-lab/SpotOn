<script lang="ts">
    import SeverityBar from "./SeverityBar.svelte";
    import TextField from "../../Input/TextField.svelte";
    import AiText from "./AiText.svelte";
    import { Brain } from "@lucide/svelte";
    let { score = 3.2 }: { score?: number } = $props();
    const statuses = ["optimal", "low", "moderate", "high", "severe"] as const;
    let normalizedScore = $derived(
        Number.isFinite(score) ? Math.min(5, Math.max(1, score)) : 1,
    );
    let status = $derived(statuses[Math.round(normalizedScore) - 1]);
</script>

<div id="risk-report-container" data-status={status}>
    <h2>Risk Report</h2>
    <p class="status">{status} risk</p>
    <SeverityBar score={normalizedScore} />

    <div class="ai-area">
        <h3>
            <span class="overview-icon" aria-hidden="true"><Brain size={20} strokeWidth={2} /></span>
            <span>AI Overview</span>
        </h3>
        <AiText />
        <TextField />
    </div>
</div>

<style>
    #risk-report-container {
        min-width: 0;
        min-height: 320px;
        display: flex;
        flex-direction: column;
        overflow-wrap: anywhere;
        margin: 0;
        padding: 24px;
        border-radius: 20px;
        background: var(--color-surface);
    }

    .status {
        margin: 4px 0 20px;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: capitalize;
    }

    h2 {
        margin-bottom: 0;
    }

    .ai-area {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
        margin-top: 24px;
        padding: 16px;
        border-radius: 12px;
        background-color: var(--color-primary-hover);
    }

    h2,
    h3 {
        margin-top: 0;
    }

    h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 0;
    }

    .overview-icon {
        display: flex;
        flex-shrink: 0;
        color: var(--color-primary);
    }
</style>
