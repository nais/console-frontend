<script lang="ts">
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { JobNetworkPolicy } = $derived(data);
</script>

<GraphErrors errors={$JobNetworkPolicy.errors} />

<Heading as="h2" class="aksel-sr-only">Network</Heading>

{#if $JobNetworkPolicy.fetching}
	<div class="loading" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{/if}

{#if $JobNetworkPolicy.data}
	{@const job = $JobNetworkPolicy.data.team.environment.job}
	<NetworkPolicy workload={job} />
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 250px;
	}
</style>
