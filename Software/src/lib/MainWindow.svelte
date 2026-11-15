<script lang="ts">
    import RiskReport from "./Dashboard/RiskReport/RiskReport.svelte";
    import Calendar from "./Dashboard/Calendar/Calendar.svelte";
    import Chart from "./Dashboard/Chart/Chart.svelte";
</script>

<div class="container">
    <div class="dashboard-content">
        <div class="widgets-container">
            <Calendar />
            <Chart />
        </div>
        <RiskReport />
    </div>
</div>

<style>
    .container {
        min-width: 0;
        min-height: calc(100vh - 72px);
        overflow: hidden;
        /* border-top-left-radius: 28px; */
        background-color: var(--color-background);
    }

    .dashboard-content {
        min-width: 0;
        min-height: calc(100vh - 72px);
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(260px, 1fr);
        padding: 24px;
        gap: 24px;
    }

    .widgets-container {
        min-width: 0;
        display: grid;
        grid-template-rows: auto minmax(240px, 1fr);
        gap: 24px;
    }

    @media (max-width: 600px) {
        .container {
            /* border-top-left-radius: 20px; */
        }

        .widgets-container {
            gap: 16px;
        }

        .dashboard-content {
            grid-template-columns: minmax(0, 1fr);
            padding: 16px;
            gap: 16px;
        }
    }
</style>
