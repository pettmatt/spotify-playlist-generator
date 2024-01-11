<script lang="ts">
    import { makeApiRequest } from "../lib/spotify"
    import { processSpotifyResponse } from "../lib/spotifyProcessResponse"

    interface SpotifyRequestError {
        error: {
            message: string
            status: number
        }
    }

    let profile: SpotifyRequestError | any = null

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

<div>
    <span>
        {#if profile?.error}
            {profile.error.message}
        {:else}
            Logged in as
            <a href={profile?.external_urls.spotify}>{profile?.display_name}</a>
        {/if}
    </span>
</div>