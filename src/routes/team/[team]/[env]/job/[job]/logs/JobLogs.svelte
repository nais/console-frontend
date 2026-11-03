<script lang="ts">
	import { apmURL } from '#lib/doc.js';
	import LegacyLogViewer from '#lib/domain/logs/LegacyLogViewer.svelte';
	import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import { page } from '$app/state';
	import { JobRunState, type RunsWithPodNames$result } from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';

	const { team }: RunsWithPodNames$result = $props();
	const destinations = $derived(exhaustive(team.environment.job.logDestinations));
	const hasSecureLogs = $derived(
		destinations.some((destination) => destination.__typename === 'LogDestinationSecureLogs')
	);
	const runs = $derived(team.environment.job.runs.nodes);
	const instances = $derived(runs.flatMap((run) => run.instances.nodes.map((node) => node.name)));
	const selectedInstance = $derived(page.url.searchParams.get('instance'));
	const initialInstances = $derived(
		selectedInstance
			? instances.filter((instance) => instance.startsWith(selectedInstance))
			: (runs.some((run) => run.status.state === JobRunState.RUNNING)
					? runs.filter((run) => run.status.state === JobRunState.RUNNING)
					: runs
				).flatMap((run) => run.instances.nodes.map((node) => node.name))
	);
	const hasLoki = $derived(
		destinations.some((destination) => destination.__typename === 'LogDestinationLoki')
	);
	const grafanaURL = $derived(
		destinations.find((destination) => destination.__typename === 'LogDestinationLoki')?.grafanaURL
	);
</script>

{#key `${team.slug}/${team.environment.environment.name}/${team.environment.job.name}/${selectedInstance ?? ''}`}
	{#if hasSecureLogs}
		<Alert variant="info"
			>The Loki viewer is unavailable for workloads with secure log destinations.</Alert
		>
	{:else if !hasLoki}
		<LegacyLogViewer
			team={team.slug}
			environment={team.environment.environment.name}
			workload={team.environment.job.name}
			{instances}
			{initialInstances}
			tracesURL={apmURL(page.params.team!, page.params.job!, 'traces')}
		/>
	{:else}
		<LogExplorer
			team={team.slug}
			environment={team.environment.environment.name}
			workload={team.environment.job.name}
			tenant={page.data.tenantName ?? ''}
			{instances}
			initialInstance={selectedInstance ?? ''}
			initialInstanceIsPrefix={selectedInstance !== null}
			{hasLoki}
			{grafanaURL}
			tracesURL={apmURL(page.params.team!, page.params.job!, 'traces')}
		/>
	{/if}
{/key}
