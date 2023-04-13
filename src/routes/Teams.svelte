<script lang="ts">
	import Next from '$lib/icons/Next.svelte';
</script>

<div class="container">
	{#each 'nada nais-core speilvendt'.split(' ') as name}
		<div class="team">
			<div>
				<p>{name}</p>
				<p>lorem ipsum</p>
			</div>
			<Next width="2rem" height="2rem" />
		</div>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.team {
		background-color: var(--a-bg-default);
		display: flex;
		justify-content: space-between;
		border-radius: 0.25rem;
		padding: 0.5rem;
		align-items: center;
		gap: 10px 0px;
	}
</style>
