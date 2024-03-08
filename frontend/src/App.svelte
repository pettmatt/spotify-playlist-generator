<script lang="ts">
    import SpotifyLogin from "./components/SpotifyLogin.svelte"
    import Questionere from "./components/Questionere.svelte"
    import PlaylistCreation from "./components/PlaylistCreation.svelte"
    import { checkSession } from "./lib/spotify"
    import "./style/navigator.css"

    // Remove the checkSession below and fix it to correlate the result of spotifyLogin checkSession function.
    let loggedIn = checkSession()
    let applicationPhase = 0
    let questionereAnswers: string[][]

    function updateQuestionereAnswers(value: any) {
        questionereAnswers = value.detail
        applicationPhase++
    }

    function startFromTheStart() {
        applicationPhase = 0
    }

    function handleUpdateLoginState(event: any) {
        loggedIn = event.detail.loggedIn
    }
</script>

<nav id="navigation" class={loggedIn ? "minimal" : "display"}>
    <h1>Playlist creator</h1>
    <SpotifyLogin on:updateLoginState={handleUpdateLoginState} />
</nav>

<main>
    {#if loggedIn }
        {#if applicationPhase === 0}
            <Questionere on:answerData={updateQuestionereAnswers} />
        {:else if applicationPhase === 1}
            <PlaylistCreation userChoices={questionereAnswers} 
                on:generateNewPlaylist={startFromTheStart} 
            />
        {/if}
    {/if}
</main>