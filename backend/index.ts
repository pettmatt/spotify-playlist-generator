import { load } from "https://deno.land/std@0.210.0/dotenv/mod.ts"
import { cors } from "npm:hono/cors"
import { Hono } from "npm:hono"

const env = await load()
const app = new Hono()
const port = Deno.env.get("APP_PORT")

const clientId = env["SPOTIFY_CLIENT_ID"]
const redirectUri = env["SPOTIFY_REDIRECT_URI"]

app.use("/spotify/*", cors({
    origin: "http://localhost:5173",
    // allowHeaders: ["Cross-Origin"],
    allowMethods: ["GET", "OPTIONS"],
    credentials: true,
}))

app.get("/", (c) => c.text("Welcome to; Spotify (not official) recommendation server"))
app.get("/spotify/login", async (c) => {
    const responseType = "code"
    const scope = "user-read-private user-read-email"

    let url = "https://accounts.spotify.com/authorize" +
        `?client_id=${clientId}` +
        `&response_type=${responseType}` +
        `&redirect_uri=${redirectUri}` +
        `&scope=${scope}`

    // let response: object | null = null

    // try {
    //     const htmlRes = await fetch(url)
    //     const html = await htmlRes.text()

    //     response = {
    //         success: true,
    //         body: {
    //             endpoint: "/spotify/login",
    //             request_url: "https://accounts.spotify.com",
    //             html: html
    //         }
    //     }
    // } catch (error) {
    //     console.warn("Spotify login request failed")
    //     response = {
    //         success: false,
    //         body: {
    //             endpoint: "/spotify/login",
    //             request_url: "https://accounts.spotify.com",
    //             error: "Server failed to request login form.",
    //             specific_error_message: error
    //         }
    //     }
    // }

    return c.redirect(url)
})

// When spotify returns the user back with /callback route, it should also send post request
app.post("/spotify/callback", async (c) => {
    const clientSecret = env["SPOTIFY_CLIENT_SECRET"]
    const body = c.req.body || null
    const state = body.state || null
    const code = body.code || null

    // Compare state
    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow

    if (state === null) {
        c.redirect("localhost:3010/#")
        // add error message that tells state is missing
    }
    
    else {
        const response = fetch("https://accounts.spotify.com/api/token", {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${
                    new ArrayBuffer.from(`${clientId}:${clientSecret}`).toString("base64")
                }`
            },
            body: {
                code: code || null,
                redirect_uri: redirectUri
            }
        })
    }
})

Deno.serve({ port: port || 3010 }, app.fetch)