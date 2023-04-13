<script lang="ts">
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
</script>

<div class="container">
	<div class="deploys">
		<DeploysIcon width="1.5rem" height="1.5rem" />
		<h3>Deploys</h3>
	</div>
	<p>123 123 deploys</p>

	<p>124 124 124 requests</p>
</div>

<style>
	.container {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		height: 100%;
		padding: 0 1.5rem;
	}
	.deploys {
		background-color: var(--a-bg-default);
		display: flex;
		border-radius: 0.25rem;
		align-items: center;
		gap: 12px;
	}
</style>
