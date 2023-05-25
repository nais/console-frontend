<script lang="ts">
	export let variables: {
		readonly name: string;
		readonly value: string;
	}[];
</script>

<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
	<ul>
		{#each variables as variable}
			<li>{variable.name}: {variable.value}</li>
		{/each}
	</ul>
</div>

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
