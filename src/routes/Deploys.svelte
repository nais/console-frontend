<script lang="ts">
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
</script>

<div class="container">
	<div class="deploys">
		<div class="icon"><DeploysIcon /></div>
		Deploys
	</div>
</div>

<style>
	.container {
		border-radius: 0.25rem;
		background-color: var(--a-bg-default);
		height: 100%;
	}
	.deploys {
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
