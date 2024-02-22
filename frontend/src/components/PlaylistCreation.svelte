<script lang="ts">
    import { getSectionFromString } from "../lib/spotifyUtils"

    export let userChoices: string[][]
    let processing: boolean = false

    async function createPlaylist() {
        const [genres, artists, tracks] = userChoices
        processing = true

        // 1) Fetch relevant values from genres, artists and tracks
        const testArtists = artists.map(artist => getSectionFromString(artist, [/<li>(.*?)<\/li>/g, /<\/?li>/g]))
        const testTracks = tracks.map(track => getSectionFromString(track, [/<li>(.*?)<\/li>/g, /<\/?li>/g]))
        console.log("Step 1", testArtists, testTracks, genres)

        // 2) Make multiple http-requests to Spotify, if the search terms cannot be put into one

        // X) Try to filter unwanted results through TF.

        // 3) Create playlist for the user
    }
</script>

{#if processing}
    <h2>Loading</h2>
{:else}
    <div class="playlist-wrapper">
        <h2>Overview</h2>
        <p>The playlist will be created using these details</p>

        <div class="overview-details">
            <h3>Genres</h3>
            <ul class="genre-overview" aria-label="genre list">
                {#each userChoices[0] as genre}
                    <li>{@html genre}</li>
                {/each}
            </ul>

            <h3>Artists</h3>
            <ul class="artist-overview" aria-label="artist list">
                {#each userChoices[1] as artist}
                    <li>{@html artist}</li>
                {/each}
            </ul>

            <h3>Tracks</h3>
            <ul class="track-overview" aria-label="track list">
                {#each userChoices[2] as track}
                    <li>{@html track}</li>
                {/each}
            </ul>
        </div>

        <button on:click={() => createPlaylist()}>Continue</button>
    </div>
{/if}