<!-- Question what the user thinks of these artists, songs and genres -->
<script lang="ts">
    import QuestionereProgressBar from "./QuestionereProgressBar.svelte"
    import { makeApiRequest } from "../lib/spotify"

    interface Question {
        question: string
        subText?: string
        uri: string
        options: string[]
        getOptions?: Function
        answer: object
        followUp?: any[]
    }

    const profile = {
        explicitContent: null,
    }
    let currentQuestion = 0
    let questions: Question[] = [
        {
            question: "Select genres you want to listen",
            uri: "/spotify/genres",
            options: [],
            getOptions: async () => {
                const genresObject = await makeApiRequest(questions[currentQuestion].uri)
                const genres = genresObject.genres.map((g: string) => {
                    return g.charAt(0).toUpperCase() + g.slice(1).replaceAll("-", " ")
                })
                return genres
            },
            answer: {},
        },
        {
            question: "Do you want to listen artists that you follow?",
            subText: "Artists you follow",
            uri: "/spotify/u/artists",
            options: [],
            getOptions: async () => {
                const artistObject = await makeApiRequest(questions[currentQuestion].uri)
                console.log(artistObject.items)
                return artistObject.items
            },
            answer: {},
        },
        {
            question: "Do you still like these tracks?",
            subText: "Select all songs you like.",
            options: [],
            uri: "/spotify/u/tracks",
            answer: {},
            followUp: [],
        },
    ]
    
    async function progress() {
        const followUp = questions[currentQuestion]?.followUp
        const previousAnswer = questions[currentQuestion]?.answer

        if (followUp) {
            if (followUp[previousAnswer?.index]) {
                const res = await makeApiRequest(followUp?.uri)
                console.log("Questionere res follow up", res)
            }

            console.log("expected follow up question")
        }

        else {
            currentQuestion < questions.length
                ? currentQuestion++
                : null
        }
    }

    async function load(){
        const profileLS = localStorage.getItem("spotify-profile") || null
        const profile = (profileLS) && JSON.parse(profileLS)

        if (profile) {
            profile.explicitContent = profile.explicit_content.filter_enabled
        }
    }

    load()
</script>

<div class="questionere-wrapper">
    <div class="header-wrapper">
        <header>
            <QuestionereProgressBar progress={
                {current: currentQuestion, ends: 3}
            } />
        </header>
    </div>
    <div class="question-wrapper">
        {#each questions as q, i}
            {#if i === currentQuestion}
                <h2>{q.question}</h2>
                <ul>
                    {#if q?.getOptions}
                        {#await q.getOptions() }
                            <p>Checking your profile</p>
                        {:then data}
                            {#each data as o}
                                <li>
                                    <button>{o}</button>
                                </li>
                            {/each}
                        {:catch error}
                                <p>Couldn't fetch resources :( {error}</p>
                        {/await}
                    {:else}
                        {#each q.options as o}
                            <li>
                                <button>{o}</button>
                            </li>
                        {/each}
                    {/if}
                </ul>
            {/if}
        {/each}

        <button disabled={currentQuestion > questions.length} on:click={progress}>
            Done
        </button>
    </div>
</div>
