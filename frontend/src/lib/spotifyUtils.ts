import { v4 as uuidv4 } from "uuid"
import { makeApiPostRequest } from "./spotify"
import type { Track } from "./types/spotifyInterface"

export function getSectionFromString(fullString: string, regex: RegExp[]): string[] | [] {
    const matches = fullString.match(regex[0])
    const snippet = matches?.map(match =>
        match.replace(regex[1], "").replace(regex[2], "")
    )

    if (snippet) return snippet

    return []
}

export function flattenArray(arr: any[]): [] {
    return arr.reduce((acc, val) => {
        if (Array.isArray(val)) acc.push(...flattenArray(val))
        else acc.push(val)
        return acc
    }, [])
}

function pickRandomValuesFromList(list: any[], returnCount: number): any[] {
    const newList = []

    for (let i = 0; i < returnCount; i++) {
        const rn = Math.floor(Math.random() * list.length)
        if (list[rn]) newList.push(list[rn])
        delete list[rn]
    }

    return newList
}

type SingleValueObject = { [key:string]: string }
export function priorityRNGFilter(object: object) {
    const keys = Object.keys(object)
    const values = Object.values(object)

    if (values.length < 5) {
        return object
    }

    let lowPriority = []
    let highPriority = []

    for (let i = 0; i < values.length; i++) {
        let obj: SingleValueObject = {}
        const name = keys[i]
        obj[name] = values[i]

        if (values[i] > 1)
            highPriority.push(obj)
        else
            lowPriority.push(obj)
    }

    while (highPriority.length < 5) {
        if (highPriority.length < 5 && lowPriority.length > 2) {
            const randomValues = pickRandomValuesFromList(
                lowPriority, Math.floor(lowPriority.length / 5)
            )
            highPriority.push(...randomValues)
        }
        else break
    }

    return highPriority
}

export function defaultRNGFilter(list: any[]) {
    return pickRandomValuesFromList(list, Math.floor(
        (list.length / 6 > 0) ? list.length / 10 : 1
    ))
}

export function extractTrackIds(list: Track[] | any[]) {
    const newList: string[] = []

    for (let i = 0; i < list.length; i++) {
        if (Array.isArray(list[i])) {
            const extractedList = extractTrackIds(list[i])
            newList.push(...extractedList)
        }

        else if (typeof list[i] === "object") {
            const trackList = list[i].tracks.items as Track[]

            for (let j = 0; j < trackList.length; j++) {
                const track = trackList[j]
                newList.push(track.uri)
            }
        }
    }

    return newList
}

export function fetchUserId() {
    const rawUserData = localStorage.getItem("spotify-profile")

    if (!rawUserData) return new Error("Local spotify profile data is missing.")

    const userData = JSON.parse(rawUserData)

    return userData.id || new Error("User ID is missing.")
}

export async function createNewPlaylist() {
    const idResponse = fetchUserId()
    if (typeof idResponse === "object") return idResponse

    const response = await makeApiPostRequest(`/spotify/u/${idResponse}/playlist/create`, {
        name: `GP-${uuidv4()}`,
        public: false,
        description: `Playlist was generated with a web tool`
    })

    if (!response.error)
        sessionStorage.setItem("spotify-playlist", JSON.stringify(response))

    return response
}

export async function addTracksToPlaylist(id: string, trackUris: string[]) {
    const response = []

    // Pushing tracks patches of 100 at a time.
    for (let i = 0; i < trackUris.length / 100; i++) {
        const res = await makeApiPostRequest(`/spotify/playlist/${id}/add`, {
            uris: trackUris.slice(i * 100, 100 * (i + 1))
        })

        response.push(res)
    }

    return response
}