<script lang="ts">
import { createEventDispatcher } from "svelte"
import { validateSessionToken, checkSession, getAccessToken } from "../lib/spotify"
import SpotifyProfile from "./SpotifyProfile.svelte"

let authenticationError: null | any = null
let authentication: boolean = (localStorage.getItem("token") ? true : false)
let pageUri: string = window.location.href

const url = new URL(pageUri)
let error = url.searchParams.get("error")
let errorDetails: string | null = null
const codeParam = url.searchParams.get("code") || null
const stateParam = url.searchParams.get("state") || null

const dispatch = createEventDispatcher()

async function validateSession() {
    const sessionIsValid = checkSession()

    // Nothing to do here. Session should be usable.
    if (sessionIsValid) return

    if (error)
        authenticationError = { error }

    else if (pageUri?.includes("callback")) {
        getAccessToken(codeParam, stateParam)
            .then(res => {
                const token = res.token
                authentication = validateSessionToken(token)
                updateLoginState(true)
            })
            .catch(err => {
                error = "Session expired, please login again."
                errorDetails = err
                logout()
                updateLoginState(false)
            })
    }
    else console.warn("If you see this, something probably broke while validating the session.")
}

function logout() {
    updateLoginState(false)
    authentication = false
    localStorage.removeItem("token")
    localStorage.removeItem("spotify-profile")
    localStorage.removeItem("token-creation-time")
}

function updateLoginState(value: boolean) {
    dispatch("updateLoginState", { loggedIn: value })
}

validateSession()
</script>

{#if authentication}
    <SpotifyProfile logout={ logout } />
{:else if authenticationError}
    <div class="error-wrapper">
        <p>Login error: <span>{ authenticationError }</span></p>
        <p>Details: <span>{ errorDetails }</span></p>
    </div>
{:else}
    <div class="login-wrapper">
        <a class="button-like-link" href="http://localhost:3010/spotify/login">Login to Spotify</a>
        <small>Application requires login to Spotify</small>
    </div>
{/if}

<style>
.login-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}
.login-wrapper a {
    width: 8em;
    text-align: center;
    margin: 0 auto;
}
.login-wrapper small {
    text-align: center;
}
.error-wrapper p span {
    color: rgb(200, 75, 75);
}
</style>