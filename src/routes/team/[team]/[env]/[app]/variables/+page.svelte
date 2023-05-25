<script lang="ts">
	import Card from '$lib/Card.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Variables } = data);
</script>

{#if $Variables.data}
	<Card>
		<ul>
			{#each $Variables.data.app.variables as variable}
				<li>{variable.name}: {variable.value}</li>
			{/each}
		</ul>
	</Card>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-direction: row;
	}
</style>
