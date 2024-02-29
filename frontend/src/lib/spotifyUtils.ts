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
            const randomValues = pickRandomValuesFromList(lowPriority, lowPriority.length / 3)
            highPriority.push(...randomValues)
        }
        else break
    }

    return highPriority
}

export function defaultRNGFilter(list: any[]) {
    return pickRandomValuesFromList(list, Math.floor(list.length / 3))
}

export function extractTrackIds(list: Track[] | any[]) {
    // const cleanList = flattenArray(tracks)
    const newList: string[] = []

    for (let i = 0; i < list.length; i++) {
        const trackList = list[i]

        for (let ii = 0; ii < trackList.length; ii++) {
            console.log("ii", list[ii])
            const searchResults = list[ii]

            for (let iii = 0; iii < searchResults.length; iii++) {
                const tracks = searchResults[iii].tracks.items

                for (let j = 0; j < tracks.length; j++) {
                    const uriString = tracks[j].uri
                    newList.push(uriString)
                }
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
        name: `generated-playlist`,
        public: false,
        description: `Generated with a web tool`
    })

    if (!response.error)
        sessionStorage.setItem("spotify-playlist", JSON.stringify(response))

    return response
}

export async function addTracksToPlaylist(id: string, trackUris: string[]) {
    const response = await makeApiPostRequest(`/spotify/playlist/${id}/add`, {
        playlist_id: id,
        uris: trackUris
    })

    if (!response.error)
        sessionStorage.setItem("spotify-playlist", JSON.stringify(response))

    return response
}