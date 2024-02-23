<script lang="ts">
    import { makeApiRequest } from "../lib/spotify";
    import { flattenArray, getRandomizePortionFromArray, getSectionFromString } from "../lib/spotifyUtils"

    export let userChoices: string[][]
    let processing: boolean = false

    async function createPlaylist() {
        const [genres, artists, tracks] = userChoices
        processing = true

        // FSeperate relevant data from HTML display strings
        const artistGenres = artists.map(artist => getSectionFromString(
            artist, [/<li class='dark-background-round'>(.*?)<\/li>/g, /<li class='dark-background-round'>/g, /<\/?li>/g]
        ))
        const artistNames = artists.map(artist => getSectionFromString(
            artist, [/<h3>(.*?)<\/h3>/g, /<h3>/g, /<\/?h3>/g]
        ))
        const trackArtists = tracks.map(track => getSectionFromString(
            track, [/<li class='dark-background-round'>(.*?)<\/li>/g, /<li class='dark-background-round'>/g, /<\/?li>/g]
        ))

        // Make multiple http-requests to Spotify, if the search term cannot be put into one!asdsa
        const similarArtistSearch = await Promise.all(
            flattenArray([...artistNames, ...trackArtists]).map(async artist => {
                const response = await makeApiRequest(`/spotify/single-search/${artist}&type=artist`)
                if (response) {
                    console.log("response", response)
                    const finalResponse = await makeApiRequest(`/spotify/artists/${response.artists.items[0].id}/related-artists`)
                    return finalResponse
                }

                else {
                    // Trigger logout or Error that says the user should log back in
                }
            })
        )

        const flatGenreList = flattenArray([...genres, ...artistGenres])
        console.log("flat", flatGenreList)
        console.log("related artists", similarArtistSearch)

        const genrePriority: any = {}
        for (let genre of flatGenreList) {
            genrePriority[genre] = (genrePriority[genre] || 0) + 1
        }

        console.log("Priority", genrePriority)

        const genreSearch = await Promise.all(
            Object.keys(genrePriority).map(async genre => {
                // Skip genre if the priority is low enough and if there is enough genres
                if (genrePriority[genre] === 1 && flatGenreList.length > 4) return

                const newSearch = await makeApiRequest(`/spotify/track/search/tag%3Anew%25${genre}`)
                const hipsterSearch = await makeApiRequest(`/spotify/track/search/tag%3Ahipster%25${genre}`)
                return [newSearch, hipsterSearch]
            })
        )

        // Make search based on similar artists
        const similarArtistSearchResult = await Promise.all(
            getRandomizePortionFromArray(similarArtistSearch).map(async artist => {
                console.log("QUKSAHDasd", artist)
                // return await makeApiRequest(`/spotify/track/search/${artist}`)
            })
        )
        console.log("Similar result", similarArtistSearchResult)
        console.log(genreSearch)

        // 3) Create playlist for the user
        

        // 4) Show the playlist with a link to it
        
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
            <ul class="overview genre" aria-label="genre list">
                {#each userChoices[0] as genre}
                    <li>{@html genre}</li>
                {/each}
            </ul>

            <h3>Artists</h3>
            <ul class="overview artist" aria-label="artist list">
                {#each userChoices[1] as artist}
                    <li>{@html artist}</li>
                {/each}
            </ul>

            <h3>Tracks</h3>
            <ul class="overview track" aria-label="track list">
                {#each userChoices[2] as track}
                    <li>{@html track}</li>
                {/each}
            </ul>
        </div>

        <button on:click={() => createPlaylist()}>Continue</button>
    </div>
{/if}