<script lang="ts">
export let progress = {
    current: 0,
    ends: 3,
}
</script>

<header class="questionere-header">
    <div class="progress-wrapper">
        {#each new Array(progress.ends) as e, i}
            <div class={`icon ${(
                (i === progress.current) ? " current" : "" 
                ||
                (i > progress.current) ? " upcoming" : ""
            )}`}>
                <i>{i + 1}</i>
            </div>
        {/each}
    </div>
</header>

<style>
.progress-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1em;
    margin-top: 2rem;
    margin-bottom: 1rem;
    pointer-events: none;
}

.icon {
    border-radius: 2rem;
    padding: 0.3em 1.2em;
    color: var(--lighter-background-color);
    background-color: var(--element-background-color);
}

.current {
    background-color: var(--spotify-green);
}

.upcoming {
    background-color: #353535;
}

i {
    font-size: 1.8rem;
}
</style>