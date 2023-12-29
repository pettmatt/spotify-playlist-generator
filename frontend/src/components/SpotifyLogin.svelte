<script lang="ts">
    import { userAuth } from "../lib/spotify"

    let authentication: null | any = null
    let pageUri: string | null = window.location.href

    const uri = new URL(pageUri)
    const error = uri.searchParams.get("error")
    const codeParam = uri.searchParams.get("code") || null
    const stateParam = uri.searchParams.get("state") || null

    test()
    function test() {
        if (error) {
            authentication = { error, token: null }
        }

        else if (!codeParam || !stateParam) {
            authentication = {
                error: {
                    message: "Cannot complete session authentication.",
                    reason : `code (${codeParam}), state (${stateParam})`
                },
                token: null
            }
        }

        else if (pageUri?.includes("callback")) {
            console.log("auth", authentication)
            userAuth(codeParam, stateParam)
        }
    }
</script>

{#if authentication !== null}
    You're connected to Spotify!
{:else}
    <div class="login-wrapper">
        <a class="button-like-link" href="http://localhost:3010/spotify/login">Login to Spotify</a>
        <small>Application requires logging in to Spotify</small>
    </div>
{/if}