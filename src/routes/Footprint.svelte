<script lang="ts">
	import CostIcon from '$lib/icons/CostIcon.svelte';
</script>

<div class="container">
	<div class="footprint">
		<div class="icon"><CostIcon /></div>
		Footprint
	</div>
</div>

<style>
	.container {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		height: 100%;
	}
	.footprint {
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
