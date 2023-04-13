<script lang="ts">
	import CostIcon from '$lib/icons/CostIcon.svelte';
</script>

<div class="container">
	<div class="footprint">
		<CostIcon width="1.5rem" height="1.5rem" />
		<h3>Footprint</h3>
	</div>
	<div>
		<p>NAV totalt - § 999 999 999</p>
		<p>nada - $12 234</p>
		<p>nais - $ 123 123</p>
		<p>tbd - $ 123 123 123</p>
		<a href="/">Se teamoversikt</a>
	</div>
</div>

<style>
	.container {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		height: 100%;
		padding: 0 1.5rem;
	}
	.footprint {
		background-color: var(--a-bg-default);
		display: flex;
		border-radius: 0.25rem;
		align-items: center;
		gap: 12px;
	}
</style>
