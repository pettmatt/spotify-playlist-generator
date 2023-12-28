<!-- Question what the user thinks of these artists, songs and genres -->
<script lang="ts">
    import QuestionereProgressBar from "./QuestionereProgressBar.svelte"
    let currentQuestion = 0
    const questions = [
        {
            question: "Test 1",
            options: [1,2,3]
        },
        {
            question: "Test 2",
            options: [1,2,3]
        },
        {
            question: "Test 3",
            options: [1,2]
        },
    ]

    function progress() {
        currentQuestion < questions.length
            ? currentQuestion++
            : null
    }
</script>

<div class="questionere-wrapper">
    <div class="header-wrapper">
        <header>
            <QuestionereProgressBar progress={
                {current: currentQuestion, ends: 3}
            } />
        </header>
    </div>
    <div class="question-wrapper">
        {#each questions as q, i}
            {#if i === currentQuestion}
                <h2>Question: {q.question}</h2>

                <ul>
                    {#each q.options as o}
                        <li>Option {o}</li>
                    {/each}
                </ul>
            {/if}
        {/each}

        <button disabled={currentQuestion > questions.length} on:click={progress}>
            Done
        </button>
    </div>
</div>
