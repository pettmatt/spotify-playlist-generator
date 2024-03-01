<script lang="ts">
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
    <nav id="navigation">
        <h1>Playlist creator</h1>
        <SpotifyLogin />
    </nav>


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
