<script lang="ts">
	import EmissionsIcon from '$lib/icons/EmissionsIcon.svelte';
</script>

<div class="container">
	<div class="emissions">
		<div class="icon"><EmissionsIcon /></div>
		Emissions
	</div>
</div>

<style>
	.container {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		height: 100%;
	}
	.emissions {
		background-color: var(--a-bg-default);
		display: flex;
		border-radius: 0.25rem;
		padding: 0.5rem;
		align-items: center;
		gap: 10px 0px;
	}
	.icon {
		margin: 0.5rem;
	}
</style>
