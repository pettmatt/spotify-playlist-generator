<script lang="ts">
    import SpotifyLogin from "./components/SpotifyLogin.svelte"
    import Questionere from "./components/Questionere.svelte"
    import PlaylistCreation from "./components/PlaylistCreation.svelte"
    import { checkSession } from "./lib/spotify"
    import "./style/navigator.css"

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
</script>

<nav id="navigation" class={loggedIn ? "minimal" : "display"}>
    <h1>Playlist creator</h1>
    <SpotifyLogin />
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