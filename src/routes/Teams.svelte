<script lang="ts">
	import Next from '$lib/icons/Next.svelte';
	let data = [
		{
			name: 'nada',
			purpose: 'world dominance'
		},
		{
			name: 'nais',
			purpose: 'core'
		},
		{
			name: 'speilvendt',
			purpose: 'frontend'
		}
	];
</script>

<div class="container">
	{#each data as { name, purpose }}
		<a class="team" href="/team/{name}">
			<div>
				<h3>{name}</h3>
				<p>{purpose}</p>
			</div>
			<div class="next">
				<Next width="2rem" height="2rem" />
			</div>
		</a>
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
		padding: 0 1rem;
		align-items: center;
		gap: 10px 0px;
		border: 1px solid transparent;
		cursor: pointer;
		color: var(--a-text-default);
		text-decoration: none;
	}
	.team:hover {
		box-shadow: var(--a-shadow-medium);
		border: 1px solid var(--a-border-action);
		color: var(--ac-link-panel-text, var(--a-text-default));
	}
	.team:hover > div > h3 {
		color: var(--a-text-action);
		text-decoration: underline;
	}
	.team:hover > .next {
		transform: translateX(0.5rem);
		transition: transform 200ms;
	}
	h3 {
		margin: 1rem 0;
	}
</style>
