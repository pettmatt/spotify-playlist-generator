<script lang="ts">
export let progress = {
    current: 0,
    ends: 3,
}
</script>

<header class="questionere-header">
    <div class="progress-wrapper">
        {#each new Array(progress.ends) as e, i}
            <div class={`icon ${
                (i === progress.current) ? " current" : ""
            }` 
            }>
                <i>{i + 1}</i>
            </div>
        {/each}

        {#if progress.current === progress.ends - 1}
            Time to generate your new playlist!
        {/if}
    </div>
</header>

<style>
.progress-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1em;
    margin-top: 2rem;
}

.icon {
    padding: 1em 1.5em;
    border-radius: 2rem;
    background-color: #1a1a1a;
    color: var(--lighter-background-color);
}

.current {
    background-color: var(--spotify-green);
}
</style>