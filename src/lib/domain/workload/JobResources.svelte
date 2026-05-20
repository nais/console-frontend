<script lang="ts">
	import Resource from '$lib/domain/resources/Resource.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		requests: { cpu: number | null; memory: number | null };
		limits: { cpu: number | null; memory: number | null };
	}

	let { requests, limits }: Props = $props();

	function formatCpu(value: number | null | undefined): string {
		if (value === null || value === undefined) {
			return 'Not set';
		}

		return `${value.toFixed(3)} CPUs`;
	}

	function formatMemory(value: number | null | undefined): string {
		if (value === null || value === undefined) {
			return 'Not set';
		}

		return prettyBytes(value, {
			locale: 'en',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			binary: true
		});
	}

	let cpuReq = $derived(formatCpu(requests.cpu));
	let cpuLim = $derived(formatCpu(limits.cpu));
	let memReq = $derived(formatMemory(requests.memory));
	let memLim = $derived(formatMemory(limits.memory));
</script>

<div class="resource-container">
	<Heading as="h3" size="small">Resource configuration</Heading>
	<div class="resource-cards">
		<Resource title="CPU" request={cpuReq} limit={cpuLim} />
		<Resource title="Memory" request={memReq} limit={memLim} />
	</div>
</div>

<style>
	.resource-container {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.resource-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ax-space-12);
	}

	@media (max-width: 767px) {
		.resource-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
