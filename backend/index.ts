import { load } from "https://deno.land/std@0.210.0/dotenv/mod.ts"
import { prettyJSON } from "hono/pretty-json"
import { cors } from "npm:hono/cors"
import { Hono } from "npm:hono"

import { generateRandomString } from "./lib/utils.ts"
import { createErrorObject } from "./lib/error.ts"

const env = await load()
const port = Deno.env.get("APP_PORT") || 3010
const app = new Hono()

const clientId = env["SPOTIFY_CLIENT_ID"]
const redirectUri = env["SPOTIFY_REDIRECT_URI"]

app.use("/*", cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Cross-Origin", "Authorization"],
    allowMethods: ["POST", "GET"],
    exposeHeaders: ["Content-Length"],
}))

app.use("*", prettyJSON())
app.use("*", async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`)
    await next()
})
app.notFound((c) => c.json({ message: "Not found", ok: false }, 404))

app.get("/", (c) => c.text("Welcome to; Spotify (not official) recommendation server"))
app.get("/spotify/login", async (c) => {
    const responseType = "code"
    const scopeArray = [
        "user-read-private", "user-library-modify", "user-read-email",
        "user-follow-read", "user-top-read", "user-read-recently-played",
        "playlist-modify-private"
    ]
    const scope = scopeArray.join(" ")
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
            message: "State value mismatch"
        }, 400)
    }

    if (code === null) {
        return c.json({
            error: "Missing value",
            message: "Code value missing"
        }, 400)
    }

    const bodyParams = new URLSearchParams()
    bodyParams.append("grant_type", "authorization_code")
    bodyParams.append("redirect_uri", redirectUri)
    bodyParams.append("code", code)
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
                status: res.status,
                details: data,
            },
        }, res.status)
    }

    return c.json({ data }, 200)
})

app.get("/spotify/u/profile", async (c) => {
    const token = c.req.header("Authorization")
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.get("/spotify/u/:endpoint", async (c) => {
    const token = c.req.header("Authorization")
    const endpoint = c.req.param("endpoint")
    const res = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}`, {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.get("/spotify/genres", async (c) => {
    const token = c.req.header("Authorization")
    const res = await fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.get("/spotify/artists/:id/related-artists", async (c) => {
    const token = c.req.header("Authorization")
    const id = c.req.param("id")
    const res = await fetch(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.get("/spotify/single-search/:query", async (c) => {
    const token = c.req.header("Authorization")
    const query = c.req.param("query")
    const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&limit=1`, {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.get("/spotify/track/search/:query", async (c) => {
    const token = c.req.header("Authorization")
    const query = c.req.param("query")
    
    const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=6`, {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
    })
    
    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.post("/spotify/u/:id/playlist/create", async (c) => {
    const token = c.req.header("Authorization")
    const id = c.req.param("id")
    const body = await c.req.json()

    const res = await fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json(
            createErrorObject(res)
        )
    }

    return c.json(data)
})

app.post("/spotify/playlist/:id/add", async (c) => {
    const token = c.req.header("Authorization")
    const id = c.req.param("id")
    const body = await c.req.json()

    const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
        return c.json({ success: false, data })
    }

    return c.json({ success: true, data })
})

Deno.serve({ port: port }, app.fetch)