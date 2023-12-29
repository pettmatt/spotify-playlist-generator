import { load } from "https://deno.land/std@0.210.0/dotenv/mod.ts"
import { prettyJSON } from "hono/pretty-json"
import { cors } from "npm:hono/cors"
import { Hono } from "npm:hono"

import { generateRandomString } from "./lib/utils.ts"

const env = await load()
const port = Deno.env.get("APP_PORT") || 3010
const app = new Hono()

const clientId = env["SPOTIFY_CLIENT_ID"]
const redirectUri = env["SPOTIFY_REDIRECT_URI"]

app.use(cors())
// app.use("/*", cors({
//     origin: "http://localhost:5173",
//     allowHeaders: ["Cross-Origin"],
//     allowMethods: ['POST', 'GET'],
//     exposeHeaders: ['Content-Length'],
// }))

app.use('*', prettyJSON())
app.use("*", async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`)
    await next()
})
app.notFound((c) => c.json({ message: "Not found", ok: false }, 404))

app.get("/", (c) => c.text("Welcome to; Spotify (not official) recommendation server"))
app.get("/spotify/login", async (c) => {
    const responseType = "code"
    const scope = "user-read-private user-read-email"
    const state = generateRandomString(16)

    const url = "https://accounts.spotify.com/authorize" +
        `?client_id=${clientId}` +
        `&response_type=${responseType}` +
        `&redirect_uri=${redirectUri}` +
        `&scope=${scope}` +
        `&state=${state}`

    return c.redirect(url)
})

// When spotify returns the user back with /callback route, it should also send post request
app.post("/spotify/token", async (c) => {
    const clientSecret = env["SPOTIFY_CLIENT_SECRET"]
    const body = await c.req.json() || null
    const { state, code } = body || null

    if (state === null) {
        return c.json({
            error: "Missing value",
            message: "State property value mismatch"
        }, 400)
    }

    const bodyParams = new URLSearchParams()
    bodyParams.append("grant_type", "authorization_code")
    bodyParams.append("redirect_uri", redirectUri)
    bodyParams.append("code", code)

    console.log("   Making request")
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: bodyParams
    })
    
    const data = await res.json()

    if (!res.ok) {
        return c.json({ 
            error: {
                message: res.statusText,
                details: data
            },
        }, res.status)
    }

    return c.json({ data }, 200)
})

Deno.serve({ port: port }, app.fetch)