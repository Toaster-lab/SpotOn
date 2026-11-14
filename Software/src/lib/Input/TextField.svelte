<script lang="ts">
    let {
        title = "Text",
        placeholder = "Enter text...",
        value = $bindable(""),
        fontSize = "14px",
    }: {
        title?: string;
        placeholder?: string;
        value?: string;
        fontSize?: string;
    } = $props();
</script>

<label class="textfield" style:font-size={fontSize}>
    <span class="title">{title}</span>

    <input type="text" bind:value {placeholder} />
</label>

<style>
    .textfield {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        box-sizing: border-box;
        font-family: inherit;
    }

    .title {
        font-weight: 500;
        color: var(--color-text);
    }

    input {
        box-sizing: border-box;
        width: 100%;
        min-height: 40px;
        min-width: 0;
        padding: 0.85em;
        border: 1px solid var(--color-outline);
        border-radius: 0.75em;
        background: var(--color-surface);
        color: var(--color-text);
        font: inherit;
        line-height: 1.5;
        outline: none;
    }

    input:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: -1px;
        border-color: var(--color-primary);
    }

    input::placeholder {
        color: var(--color-text-secondary);
    }
</style>
