<script lang="ts">
    import Window from "../../Window/Window.svelte";
    import TextField from "../../Input/TextField.svelte";

    let { open = $bindable(false), initialQuestion = "", status = "moderate" }: {
        open?: boolean; initialQuestion?: string; status?: string;
    } = $props();
    type Message = { role: "assistant" | "user"; text: string };
    let messages = $state<Message[]>([]);
    let draft = $state("");
    let wasOpen = false;

    function reply(question: string) {
        if (/iron|ferritin|hemoglobin/i.test(question)) {
            return "The sample report flags a downward iron trend. Your flight medical team would review iron-related markers together against your personal baseline, with menstrual history and mission conditions providing context. This demo has no live readings.";
        }
        if (/anomal|inflamm|warning|alert/i.test(question)) {
            return "The sample inflammatory marker differs from its recent trend. This is a flag for review, not a diagnosis. Your flight medical team would interpret the result alongside other markers and how you feel. This demo cannot assess symptoms or determine urgency.";
        }
        if (/cycle|menstr|female|period/i.test(question)) {
            return "Menstrual cycle information, where available, can provide context for blood marker trends. This demo has no cycle history or personal baseline and cannot attribute a change to your cycle. Your flight medical team would review those details together.";
        }
        return `Your sample meter shows ${status} risk. An iron trend and an inflammatory marker anomaly are highlighted for review; other sample markers remain near baseline. Ask about iron, anomaly warnings, or menstrual cycle context. These are scripted responses without live health data.`;
    }

    function addQuestion(question: string) {
        messages = [...messages, { role: "user", text: question }, { role: "assistant", text: reply(question) }];
    }

    $effect(() => {
        if (open && !wasOpen) {
            if (!messages.length) messages = [{ role: "assistant", text: `Your sample health overview shows ${status} risk. What would you like to explore about the blood marker trends or anomaly warnings?` }];
            if (initialQuestion) addQuestion(initialQuestion);
        }
        wasOpen = open;
    });

    function send(event: SubmitEvent) {
        event.preventDefault();
        if (!draft.trim()) return;
        addQuestion(draft.trim());
        draft = "";
    }
</script>

<Window bind:open title="AI Health Chat">
    <div class="health-chat">
        <p class="demo-note">Sample conversation · scripted responses · no live health data</p>
        <div class="messages" role="log" aria-label="Health conversation" aria-live="polite">
            {#each messages as message}
                <div class="message" class:user={message.role === "user"}>
                    <strong>{message.role === "user" ? "You" : "AI health assistant"}</strong>
                    <p>{message.text}</p>
                </div>
            {/each}
            <div class="latest" aria-hidden="true"></div>
        </div>
        <form onsubmit={send}>
            <TextField title="Your message" placeholder="Ask about your health overview… Press Enter" bind:value={draft} />
        </form>
    </div>
</Window>

<style>
    .health-chat { display: grid; gap: 16px; min-width: 0; }
    .demo-note { margin: 0; color: var(--color-text-secondary); font-size: 0.8rem; }
    .messages { display: flex; flex-direction: column; gap: 12px; max-height: 42dvh; overflow-y: auto; overflow-anchor: none; }
    .latest { overflow-anchor: auto; height: 1px; flex-shrink: 0; }
    .message { padding: 12px; background: var(--color-background); }
    .message.user { margin-left: 24px; background: var(--color-primary-hover); }
    .message strong { font-size: 0.8rem; }
    .message p { margin: 6px 0 0; white-space: pre-wrap; }
    form { display: grid; gap: 12px; }
</style>
