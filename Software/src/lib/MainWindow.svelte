<script lang="ts">
    import RiskReport from "./Dashboard/RiskReport/RiskReport.svelte";
    import Calendar from "./Dashboard/Calendar/Calendar.svelte";
    import Chart from "./Dashboard/Chart/Chart.svelte";
</script>

<div class="container">
    <div class="grid">
        <div class="widgets-container">
            <Calendar />
            <Chart />
        </div>
        <RiskReport />
    </div>
</div>

<style>
    .container {
        height: 100%;
        width: 100%;
    }

    .grid {
        height: 100vh;
        width: 100%;
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: widgets risk-report;
    }

    .widgets-container {
        height: 100%;
        grid-area: "widgets";
    }
</style>
