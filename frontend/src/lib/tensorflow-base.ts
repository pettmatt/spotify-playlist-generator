import * as tf from "@tensorflow/tfjs"
import { type Artist, type Track } from "./spotifyInterface"
// import * as tf from "@tensorflow/tfjs-node-gpu"

type UserReference = {
    genre: string
    score: number
}

const bands = ["Linkin Park", "Nirvana", "Three Nights"]
const genres = ["Rock", "Pop", "Industrial"]

// const userVotes = tf.tensor([
//     [10, 9, 1],
//     [0, 1, 3],
//     [7, 9, 8],
// ])

// const bandGenres = tf.tensor([
//     [1, 0, 1],
//     [1, 0, 0],
//     [0, 0, 1],
// ])

function createTensors(artists: Artist[], genres: string[], tracks: Track[], userPreference: UserReference[]) {
    const genreIndexList = genres.map((g, i) => i)
    // list of genres of the artist, contains 1 or 0 -> [genre01, genre02...]
    const ArtistGenreList = artists.map((a, i) => {
        const artistGenres = genres.map((g, i) => {
            if (a.genres.findIndex(artistGenre => artistGenre === g)) return 1
            else return 0
        })

        return artistGenres
    })

    // userGenres that are valued based on preference -> [genre01 * preference ...]
    // At the moment the genre only includes the index number of the genre without including the score.
    const userGenrePreferenceList = userPreference.map((preference, i) => {
        const index = genres.findIndex(genre => genre === preference.genre)
        const genreIndexes = genreIndexList[index]
        return genreIndexes
    })

    return []
}

// userVotes: Array<number[]>, bands: string[], genres: string[]
export default function dotProduct(bands: Artist[], genres: Genre[], tracks: Track[]) {
    const tensors = createTensors(bands, genres, tracks)
    const userGenres = tf.matMul(userVotes, bandGenres)
    userGenres.print()

    // Get the top result
    const topUserGenres: any = tf.topk(userGenres, genres.length)

    // transform the data into something that is readable in JavaScript
    const topGenres = topUserGenres.indices.arraySync()

    const result = users.map((user, index) => {
        const rankedCategories = topGenres[index].map((v: any) => genres[v])
        // New recommendations based on best rated genres
        console.log(user, rankedCategories)
        return rankedCategories
    })

    return result
}