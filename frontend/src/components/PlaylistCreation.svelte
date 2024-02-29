<script lang="ts">
    import { checkSession, makeApiRequest } from "../lib/spotify"
    import { createNewPlaylist, defaultRNGFilter, flattenArray, extractTrackIds, getSectionFromString, priorityRNGFilter } from "../lib/spotifyUtils"

    export let userChoices: string[][]
    let processing: boolean = false
    let message: string | null = null

    async function createPlaylist() {
        // TODO: Currently this function result to around 5000 tracks being fetched. Chech how to reduce it to 100

        // Check if session is still valid
        if (!checkSession()) return

        const genres = userChoices[0] ?? []
        const artists = userChoices[1] ?? []
        const tracks = userChoices[2] ?? []
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
            flattenArray([...artistNames, ...trackArtists])
                .map(async artist => {
                    const response = await makeApiRequest(`/spotify/single-search/${artist}&type=artist`)
                    const finalResponse = await makeApiRequest(`/spotify/artists/${response.artists.items[0].id}/related-artists`)

                    return finalResponse
                })
        )

        const flatGenreList = flattenArray([ ...genres, ...artistGenres])

        // Based on how many times genre appears, its priority rises and is more likely to be searched.
        const genrePriority: any = {}
        for (let genre of flatGenreList) {
            genrePriority[genre] = (genrePriority[genre] || 0) + 1
        }

        console.log("Priority", genrePriority)

        // Filtering lists with some RNG
        const filteredGenres = priorityRNGFilter(genrePriority)
        const filteredArtists = similarArtistSearch.map(result => 
            defaultRNGFilter(result.artists)
        )

        const genreSearch = await Promise.all(
            Object.keys(filteredGenres).map(async genre => {
                const newSearch = await makeApiRequest(`/spotify/track/search/${genre}`)
                // const hipsterSearch = await makeApiRequest(`/spotify/track/search/tag%3Ahipster%25${genre}`)
                return newSearch
            })
        )

        // Make search based on similar artists
        const artistResults = await Promise.all(
            filteredArtists.map(async artists => {
                const artistsResults = await Promise.all(
                    artists.map(async artist => {
                        const searchResult = await makeApiRequest(`/spotify/track/search/${artist.name}`)
                        return searchResult
                    })
                )
                return artistsResults
            })
        )

        // 3) Create playlist for the user
        // const playlistResponse = await createNewPlaylist()

        // if (playlistResponse.error) {
        //     console.log(playlistResponse)
        //     processing = false
        //     message = `${playlistResponse.error.message} ${playlistResponse.error.status} error`
        //     return
        // }

        // const playlistId = playlistResponse.id
        // console.log("playlist id", playlistResponse)
        const genreTrackIds = extractTrackIds(genreSearch)
        const artistTrackIds = extractTrackIds(artistResults)
        console.log(genreTrackIds)
        console.log(artistTrackIds)

        // 4) Show the playlist with a link to it
        
    }
</script>

{#if processing}
    <h2>Loading</h2>
{:else if message}
    <h2>Message</h2>
    <p>{message}</p>
{:else}
    <div class="playlist-wrapper">
        <h2>Overview</h2>
        <p>The playlist will be created using these details</p>

        <div class="overview-details">
            <h3>Genres</h3>
            <ul class="overview genre" aria-label="genre list">
                {#if userChoices[0]}
                    {#each userChoices[0] as genre}
                        <li>{@html genre}</li>
                    {/each}
                {/if}
            </ul>

            <h3>Artists</h3>
            <ul class="overview artist" aria-label="artist list">
                {#if userChoices[1]}
                    {#each userChoices[1] as artist}
                        <li>{@html artist}</li>
                    {/each}
                {/if}
            </ul>

            <h3>Tracks</h3>
            <ul class="overview track" aria-label="track list">
                {#if userChoices[2]}
                    {#each userChoices[2] as track}
                        <li>{@html track}</li>
                    {/each}
                {/if}
            </ul>
        </div>

        <button on:click={() => createPlaylist()}>Continue</button>
    </div>
{/if}