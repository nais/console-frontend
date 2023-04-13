<script lang="ts">
	import EmissionsIcon from '$lib/icons/EmissionsIcon.svelte';
</script>

<div class="container">
	<div class="emissions">
		<EmissionsIcon width="1.5rem" height="1.5rem" />
		<h3>Emissions</h3>
	</div>
	<p>NAV total - 1 012 124 t/mo CO2</p>
	<p>nada - 123 353 t/mo CO2</p>
	You are among the top 10 biggest contributors to NAV’s emissions.
	<a href="/">Read more on how to reduce your emissions</a>
	<p>nais - 13 353 t/mo CO2</p>
	<p>tbd - 13 353 t/mo CO2</p>
</div>

<style>
	.container {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		height: 100%;
		padding: 0 1.5rem;
	}
	.emissions {
		background-color: var(--a-bg-default);
		display: flex;
		border-radius: 0.25rem;
		align-items: center;
		gap: 12px;
	}
</style>
