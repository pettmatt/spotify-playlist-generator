<script lang="ts">
    let logged: null | any = null
    let spotifyForm: null | string = null

    let pageUri: string | null = window.location.href

    // Compare state
    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow
    if (pageUri.includes("callback")) {
        const uri = new URL(pageUri)
        if (uri.searchParams.get("error")) {
            // Handle error
        } else {
            // else manage auth code
            const codeParam = uri.searchParams.get("code")
            console.log("CODE", codeParam)
        }
    }
    else pageUri = null
    
</script>

{#if logged !== null}
    You're connected to Spotify!
{:else}
    <small>Requires logging in to Spotify</small>
    <a href="http://localhost:3010/spotify/login">Normal link test</a>
{/if}