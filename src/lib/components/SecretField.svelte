<script lang="ts">
import { EyeIcon, EyeSlashIcon } from "@nais/ds-svelte-community/icons";

	let show = false; 
    export let value: String;

    function toggle() {
        show = !show 
    }
</script>

{#if show}
<input type="text" bind:value={value} />
{:else}
<input type="password" bind:value={value} />
{/if}
<button on:click={toggle}>
    {#if show}
    <EyeSlashIcon/>
    {:else}
    <EyeIcon/>
    {/if}
</button>

<style>
    button {
        background: transparent;
        border: none; 
        margin-left: -30px; 
    }
</style>
