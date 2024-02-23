<!-- Question what the user thinks of these artists, songs and genres -->
<script lang="ts">
    import "../style/questionere.css"
    import { type Artist, type Question, type Track } from "../lib/types/spotifyInterface"
    import QuestionereProgressBar from "./QuestionereProgressBar.svelte"
    import { createEventDispatcher } from "svelte"
    import { makeApiRequest } from "../lib/spotify"

    const dispatch = createEventDispatcher()
    let answers: string[][] = []

    const profile = { explicitContent: null }
    let currentQuestion = 0
    let questions: Question[] = [
        {
            question: "Select genres",
            uri: "/spotify/genres",
            getOptions: async (): Promise<string>  => {
                const genresObject = await makeApiRequest(questions[currentQuestion].uri)
                const genres = genresObject.genres.map((g: string) =>
                    capitalizeReplaceDashesInString(g)
                )
                return genres.map((g: string) => g)
            }
        },
        {
            question: "Do you still listen to them?",
            subText: "Select artists that you want to influence your playlist.",
            uri: "/spotify/u/artists",
            getOptions: async (): Promise<string> => {
                const artistObject = await makeApiRequest(questions[currentQuestion].uri)
                const artists = artistObject.items
                return artists.map((a: Artist) => 
                    "<img src='" + a.images[2].url + "' alt='" + a.type + " profile image' />" +
                    "<div class='details artist'>" +
                    "<h3>" + a.name + "</h3>" +
                    "<div class='genre-wrapper'>" +
                        "<ul>" +
                            a.genres.map((g: string) => (
                                "<li class='dark-background-round'>" + capitalizeReplaceDashesInString(g) + "</li>"
                            )) +
                        "</ul>" +
                    "</div>"
                )
            }
        },
        {
            question: "Do you still like these tracks?",
            subText: "Select tracks you want to influence your playlist.",
            uri: "/spotify/u/tracks",
            type: null,
            getOptions: async (): Promise<string> => {
                const trackObject = await makeApiRequest(questions[currentQuestion].uri)
                const tracks = trackObject.items
                return tracks.map((t: Track) =>
                    "<img src='" + t.album.images[1].url + "' alt='" + t.type + " image' />" +
                    "<div class='details track'>" +
                        "<h3>" + t.name + "</h3>" +
                        "<p>" + t.album.name + "</p>" +
                        "<div class='artist-wrapper'>" +
                            "<ul>" +
                                t.artists.map((a: Artist) => 
                                    "<li class='dark-background-round'>" +
                                        a.name +
                                    "</li>"
                                ) +
                            "</ul>" +
                        "</div>" +
                    "</div>"
                )
            },
        },
        // {
        //     question: "New playlist",
        //     uri: "/spotify/search/heavy",
        //     getOptions: async (): Promise<string> => {
        //         const resultObject = await makeApiRequest(questions[currentQuestion].uri)
        //         const results = resultObject.items
        //         return results.map((r: Track) =>
        //             "<img src='" + r.album.images[1].url + "' alt='" + r.type + " image' />" +
        //             "<h3>" + r.name + "</h3>" +
        //             "<p>" + r.album.name + "</p>"
        //         )
        //     },
        // }
    ]

    function capitalizeReplaceDashesInString(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1).replaceAll("-", " ")
    }

    function progress() {
        if (currentQuestion < questions.length)
            currentQuestion++
        else
            dispatch("answerData", answers)
    }

    async function load(){
        const profileLS = localStorage.getItem("spotify-profile") || null
        const profile = (profileLS) && JSON.parse(profileLS)

        if (profile) {
            profile.explicitContent = profile.explicit_content.filter_enabled
        }
    }

    function toggleAnswer(innerHTML: string) {
        if (answers[currentQuestion] === undefined) answers[currentQuestion] = []
        const answer = answers[currentQuestion]
        const name = innerHTML

        if (answer.includes(name))
            answers[currentQuestion] = answer.filter(a => a !== name)
        else
            answers[currentQuestion] = [...answer, name]
    }

    function handleToggleClick(o: string) {
        const value = o.toLocaleLowerCase()
        toggleAnswer(value)
        console.log(answers)
    }

    load()
</script>

<div class="questionere-wrapper">
    <header class="questionere-header">
        <QuestionereProgressBar progress={
            {current: currentQuestion, ends: questions.length}
        } />
    </header>
    <div class="question-wrapper">
        {#each questions as q, i}
            {#if i === currentQuestion}
                <h2>{q.question}</h2>
                {#if q?.subText}
                    <p>{q.subText}</p>
                {/if}
                <ul class="list-wrapper">
                    {#if q?.getOptions}
                        {#await q.getOptions() }
                            <p>Fetching resources</p>
                        {:then data}
                            {#each data as o}
                                <li class={((i === 0) 
                                    ? "genre"
                                    : (i === 1) 
                                        ? "artist"
                                        : "track"
                                    )
                                    + " item-wrapper"}
                                >
                                    <button type="button" on:click={() => handleToggleClick(o)}
                                        class={answers[currentQuestion] !== undefined && 
                                            answers[currentQuestion].includes(o.toLocaleLowerCase())
                                                ? "selected"
                                                : ""}
                                    >
                                        {@html o}
                                    </button>
                                </li>
                            {/each}
                        {:catch error}
                            <p class="error-message">Couldn't fetch resources :(</p>
                            <p>Check if the session has expired.</p>
                        {/await}
                    {/if}
                </ul>
            {/if}
        {/each}

        <button disabled={currentQuestion > questions.length} on:click={progress}>
            Done
        </button>
    </div>
</div>