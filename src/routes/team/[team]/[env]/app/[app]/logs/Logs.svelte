<script lang="ts">
	import { apmURL } from '#lib/doc.js';
	import LegacyLogViewer from '#lib/domain/logs/LegacyLogViewer.svelte';
	import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
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
	{:else if !hasLoki}
		<LegacyLogViewer
			team={team.slug}
			environment={team.environment.environment.name}
			workload={team.environment.application.name}
			{instances}
			initialInstances={selectedInstance ? [selectedInstance] : instances}
			tracesURL={apmURL(page.params.team!, page.params.app!, 'traces')}
		/>
	{:else}
		<LogExplorer
			team={team.slug}
			environment={team.environment.environment.name}
			workload={team.environment.application.name}
			tenant={page.data.tenantName ?? ''}
			{instances}
			initialInstance={selectedInstance ?? ''}
			{hasLoki}
			{grafanaURL}
			tracesURL={apmURL(page.params.team!, page.params.app!, 'traces')}
		/>
	{/if}
{/key}
