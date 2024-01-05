<script lang="ts">
    import { makeApiRequest } from "../lib/spotify"

    let profile: string | null = null

    async function getProfile() {
        const profileRes = await makeApiRequest("/spotify/profile")
        profile = profileRes
        console.log(profile)
    }

    getProfile()
</script>

<div>
    Profile
</div>