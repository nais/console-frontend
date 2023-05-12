<script lang="ts">
	import Card from '$lib/Card.svelte';
	import DeploysIcon from '$lib/icons/DeploysIcon.svelte';
</script>

<Card>
	<div class="deploys">
		<DeploysIcon size="1.5rem" />
		<h3>Deploys</h3>
	</div>
	<p>123 123 deploys</p>

	<p>124 124 124 requests</p>
</Card>

<style>
	.deploys {
		background-color: var(--a-bg-default);
		display: flex;
		border-radius: 0.25rem;
		align-items: center;
		gap: 12px;
	}
</style>
