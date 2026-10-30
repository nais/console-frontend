<script lang="ts">
	import { apmURL } from '#lib/doc.js';
	import { exhaustive } from '#lib/utils/houdini.js';
	import LokiLogs from '#lib/domain/logs/LokiLogs.svelte';
	import { page } from '$app/state';
	import type { Instances$result } from '$houdini';
	import { Alert } from '#lib/shadcn/ui/index.js';

	const { team }: Instances$result = $props();
	const destinations = $derived(exhaustive(team.environment.application.logDestinations));
	const hasSecureLogs = $derived(
		destinations.some((destination) => destination.__typename === 'LogDestinationSecureLogs')
	);
	const instances = $derived(team.environment.application.instances.nodes.map((node) => node.name));
	const selectedInstance = $derived(page.url.searchParams.get('instance'));
	const selectedInstances = $derived(selectedInstance ? [selectedInstance] : instances);
	const hasLoki = $derived(
		destinations.some((destination) => destination.__typename === 'LogDestinationLoki')
	);
	const grafanaURL = $derived(
		destinations.find((destination) => destination.__typename === 'LogDestinationLoki')?.grafanaURL
	);
</script>

{#key `${team.slug}/${team.environment.environment.name}/${team.environment.application.name}/${selectedInstance ?? ''}`}
	{#if hasSecureLogs}
		<Alert variant="info"
			>The Loki viewer is unavailable for workloads with secure log destinations.</Alert
		>
	{:else}
		<LokiLogs
			team={team.slug}
			environment={team.environment.environment.name}
			workload={team.environment.application.name}
			container={team.environment.application.name}
			{instances}
			initialInstances={selectedInstances}
			startOnMount={Boolean(selectedInstance)}
			{hasLoki}
			{grafanaURL}
			tracesURL={apmURL(page.params.team!, page.params.app!, 'traces')}
		/>
	{/if}
{/key}
