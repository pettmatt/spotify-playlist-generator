<script lang="ts">
    import { validateSessionToken, checkSession, getAccessToken } from "../lib/spotify"
    import SpotifyProfile from "./SpotifyProfile.svelte"

    let authenticationError: null | any = null
    let authentication: boolean = (localStorage.getItem("token") ? true : false)
    let pageUri: string = window.location.href

    const url = new URL(pageUri)
    const error = url.searchParams.get("error")
    const codeParam = url.searchParams.get("code") || null
    const stateParam = url.searchParams.get("state") || null

    function validateSession() {
        const sessionIsValid = checkSession()

        if (sessionIsValid) return // Nothing to do here. Session should be usable.

        if (error) {
            authenticationError = { error }
        }
        else if (pageUri?.includes("callback")) {
            getAccessToken(codeParam, stateParam)
                .then(res => {
                    console.log("userauth res", res)
                    const token = res.token
                    authentication = validateSessionToken(token)
                })
                .catch(err => {
                    // "Session expired, please login again."
                    // "Authentication failed, please try again."
                    console.log("ERROR", err)
                    logout()
                })
        }
        else console.log("ExchangeAuthCode else clause... Better check why we went here")
    }

    function logout() {
        authentication = false
        localStorage.removeItem("token")
        localStorage.removeItem("token-creation-time")

        if (pageUri.includes("callback"))
            history.pushState(null, "", url.origin)
    }

    validateSession()
</script>

{#if authentication}
    <SpotifyProfile />
    <button on:click={ logout }>Logout</button>
{:else if authenticationError}
    <div class="error-wrapper">
        <p>Login error: <span>{ authenticationError }</span></p>
        <p>Details: <span>{ authenticationError }</span></p>
    </div>
{:else}
    <div class="login-wrapper">
        <a class="button-like-link" href="http://localhost:3010/spotify/login">Login to Spotify</a>
        <small>Application requires logging in to Spotify</small>
    </div>
{/if}