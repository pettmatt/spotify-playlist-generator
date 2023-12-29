const serverUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3010"

export function userAuth(code: string, state: string) {
    const response = fetch(`${serverUrl}/spotify/token`, {
        method: "POST",
        body: JSON.stringify({
            code,
            state,
        })
    })

    console.log("Response", response)

    if (!response.ok)
        throw new Error("User authentication was not OK")

    console.log("Here2", response)

    return response.json()
    // return { error, token: null }
}

export function logOut() {

}

export async function getTopSongs(token: string) {
    const config = {
        Authorization: `Bearer`
    }

    // const authRes = await fetch("https://api.spotify.com/v1", config)
}