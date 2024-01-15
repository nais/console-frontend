<script lang="ts">
import { EyeIcon } from "@nais/ds-svelte-community/icons";

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
<button on:click={toggle}><EyeIcon/></button>

<style>
    button {
        background: transparent;
        border: none; 
        margin-left: -30px; 
    }
</style>
