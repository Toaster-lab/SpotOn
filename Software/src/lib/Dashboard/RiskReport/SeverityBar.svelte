<script lang="ts">
    let {
        score = 1,
    }: {
        score?: number;
    } = $props();

    let position = $derived(Math.min(5, Math.max(1, score)) - 1);
</script>

<div class="severity-bar">
    <div class="stage optimal"></div>
    <div class="stage low"></div>
    <div class="stage moderate"></div>
    <div class="stage high"></div>
    <div class="stage severe"></div>

    <div class="indicator" style:left="{(position / 4) * 100}%"></div>
</div>

<style>
    .severity-bar {
        position: relative;
        display: flex;
        width: 100%;
        height: 18px;
        gap: 4px;
    }

    .stage {
        flex: 1;
        border-radius: 5px;
    }

    .optimal {
        background: var(--color-risk-optimal);
    }

    .low {
        background: var(--color-risk-low);
    }

    .moderate {
        background: var(--color-risk-moderate);
    }

    .high {
        background: var(--color-risk-high);
    }

    .severe {
        background: var(--color-risk-severe);
    }

    .indicator {
        position: absolute;
        top: 50%;
        width: 12px;
        height: 26px;
        background: var(--color-text);
        border: 2px solid var(--color-surface);
        border-radius: 4px;
        transform: translate(-50%, -50%);
        box-sizing: border-box;
    }
</style>
