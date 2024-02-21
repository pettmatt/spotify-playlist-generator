<!-- Question what the user thinks of these artists, songs and genres -->
<script lang="ts">
    import { type Artist, type Question, type Track } from "../lib/spotifyInterface"
    import QuestionereProgressBar from "./QuestionereProgressBar.svelte"
    import { makeApiRequest } from "../lib/spotify"

    const profile = { explicitContent: null }
    let currentQuestion = 0
    let answers: string[][] = []
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
                    "<h3>" + a.name + "</h3>" +
                    "<div class='genre-wrapper'>" +
                        "<ul>" +
                            a.genres.map((g: string) => (
                                "<li>" + capitalizeReplaceDashesInString(g) + "</li>"
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
            getOptions: async (): Promise<string> => {
                const trackObject = await makeApiRequest(questions[currentQuestion].uri)
                const tracks = trackObject.items
                return tracks.map((t: Track) =>
                    "<img src='" + t.album.images[1].url + "' alt='" + t.type + " image' />" +
                    "<h3>" + t.name + "</h3>" +
                    "<p>" + t.album.name + "</p>" +
                    "<div class='genre-wrapper'>" +
                        "<ul>" +
                            t.artists.map((a: Artist) => 
                                "<li>" +
                                    a.name +
                                "</li>"
                            ) +
                        "</ul>" +
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
    
    async function progress() {
        // const followUp = questions[currentQuestion]?.followUp
        // const previousAnswer = questions[currentQuestion]?.answers

        currentQuestion < questions.length
            ? currentQuestion++
            : null
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

    // Just a reminder that some times ugly and simple is better.
    // function defineArgument(fullArgument: string, regex: RegExp[] | null = null): string | string[] {
    //     if (regex) {
    //         const matches = fullArgument.match(regex[0])
    //         const innerHTML = matches?.map(match => match.replace(regex[1], ""))
    //         console.log("Inner", innerHTML)

    //         if (innerHTML) return innerHTML
    //     }

    //     return fullArgument
    // }

    function handleToggleClick(o: string) {
        const value = o.toLocaleLowerCase()
        toggleAnswer(value)
        console.log(answers)
    }

    load()
</script>

<div class="questionere-wrapper">
    <div class="header-wrapper">
        <header>
            <QuestionereProgressBar progress={
                {current: currentQuestion, ends: questions.length}
            } />
        </header>
    </div>
    <div class="question-wrapper">
        {#each questions as q, i}
            {#if i === currentQuestion}
                <h2>{q.question}</h2>
                {#if q?.subText}
                    <p>{q.subText}</p>
                {/if}
                <ul class="question-item-wrapper">
                    {#if q?.getOptions}
                        {#await q.getOptions() }
                            <p>Fetching resources</p>
                        {:then data}
                            {#each data as o}
                                <li class="item-wrapper" style:border={ answers[currentQuestion] !== undefined && answers[currentQuestion].includes(o.toLocaleLowerCase()) ? "solid pink 2px" : "" }>
                                    <button type="button" on:click={() => handleToggleClick(o)}>
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

<style>
    .questionere-wrapper {
        margin-top: 2rem;
    }
    .header-wrapper {
        text-align: center;
    }
    .question-item-wrapper {
        height: 59vh;
        overflow-y: scroll;
    }
    .item-wrapper {
        display: flex;
        flex-direction: row;
    }
    ul {
        padding-left: 0;
    }
    div ul li {
        margin: 0.25em 0;
        text-align: left;
        width: 100%;
    }
    :global(.genre-wrapper ul) {
        list-style-type: none;
        padding-left: 0;
    }
    :global(.genre-wrapper ul li) {
        padding: 0.3em 0.5em;
        margin: 0.25em;
        background-color: rgba(0, 0, 0, 0.4);
        display: inline-block;
        border-radius: 0.25em;
        max-width: 35%;
    }
    :global(div ul li > *) {
        width: 100%;
        text-align: left;
    }
</style>