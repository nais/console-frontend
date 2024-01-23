<script lang="ts">
	import { Tr } from "@nais/ds-svelte-community";
	import { ChevronDownIcon, ChevronUpIcon } from "@nais/ds-svelte-community/icons";

	/**
	 * Is expanded ?
	 */
	let expanded = false
    
	/**
	 * Expander toggle
	 */
	function toggle() {
		expanded = ! expanded;
	}

	/**
	 * Colspan
	 */
	export let n = 999;
</script>

<Tr class="navds-table--expandable-row">
	<td
    class:navds-table--data-cell={true}
    class:navds-table--toggle-expand-cell={true}
    class:navds-table--toggle-expand-cell--open={expanded} 
    class:navds-body-short={true}
    class:navds-body-short--medium={true}
    >
		<button on:click={toggle}

        style= "background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        height: 2rem;
        margin: 0;
        width: 2rem"
        >
			{#if expanded}
				<ChevronUpIcon/>
			{:else}
				<ChevronDownIcon/>
			{/if}
		</button>
	</td>
	<slot name="row-content" />
</Tr>
{#if expanded}
<tr>
	<td colspan={n} class="navds-table--expanded-row-cell">
		<slot name="expander-content" />
	</td>
</tr>
{/if}
