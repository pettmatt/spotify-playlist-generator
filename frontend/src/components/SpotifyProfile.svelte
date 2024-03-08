<script lang="ts">
    import { makeApiRequest } from "../lib/spotify"
    import { processSpotifyResponse } from "../lib/spotifyProcessResponse"

    export let logout: any

    interface SpotifyRequestError {
        error: {
            message: string
            status: number
        }
    }

    let profile: SpotifyRequestError | any = null
    let showProfile = false

    async function getProfile() {
        const profileLS = localStorage.getItem("spotify-profile")
        if (profileLS) {
            profile = JSON.parse(profileLS)
        } else {
            const profileRes = await makeApiRequest("/spotify/u/profile")
            profile = processSpotifyResponse(profileRes)
            localStorage.setItem("spotify-profile", JSON.stringify(profile))
        }
    }

    getProfile()
</script>

<div class="profile-wrapper">
    {#if profile?.error}
        {profile.error.message}
    {:else}
        {#if !showProfile}
            <a class="profile" href={profile?.external_urls.spotify}>
                <img class="profile-image" loading="lazy" src={profile?.images[0].url} alt="Profile" />
                <span>{profile?.display_name}</span>
            </a>
        {/if}

        <button class="link-like-button" on:click={ logout }>Logout</button>
    {/if}
</div>

<style>
.profile-wrapper {
    display: flex;
    flex-direction: column;
    text-align: right;
}
.profile {
    display: flex;
    max-width: 12em;
    border-radius: 2em;
    border: 2px solid none;
    gap: 0.5em;
    transform: ease 0.5s border;
}
.profile:hover {
    color: var(--spotify-green);
}
.profile-image {
    border-radius: 2em;
    width: 2rem;
}
</style>