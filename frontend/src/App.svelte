<script lang="ts">
    import tfMain from "./lib/tensorflow-base"
    import SpotifyLogin from "./components/SpotifyLogin.svelte"
    import Questionere from "./components/Questionere.svelte"
    import PlaylistCreation from "./components/PlaylistCreation.svelte"
    import { checkSession } from "./lib/spotify"

    let loggedIn = checkSession()
    let applicationPhase = 0
    let questionereAnswers: string[][]

    function updateQuestionereAnswers(value: any) {
        questionereAnswers = value.detail
        applicationPhase++
    }
</script>

<main>
    <h1>Music recommender</h1>

    <SpotifyLogin />

    {#if loggedIn }
        {#if applicationPhase === 0}
            <Questionere on:answerData={updateQuestionereAnswers} />
        {:else if applicationPhase === 1}
            <PlaylistCreation userChoices={questionereAnswers} />
        {:else if applicationPhase === 2}
            <h2>Enjoy</h2>
        {/if}
    {/if}
</main>
