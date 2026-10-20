<script lang="ts">
	import { apmURL } from '#lib/doc.js';
	import { exhaustive } from '#lib/utils/houdini.js';
	import LokiLogs from '#lib/domain/logs/LokiLogs.svelte';
	import { page } from '$app/state';
	import { JobRunState, type RunsWithPodNames$result } from '$houdini';

	const { team }: RunsWithPodNames$result = $props();
	const destinations = $derived(exhaustive(team.environment.job.logDestinations));
	const runs = $derived(team.environment.job.runs.nodes);
	const instances = $derived(runs.flatMap((run) => run.instances.nodes.map((node) => node.name)));
	const selectedInstance = $derived(page.url.searchParams.get('instance'));
	const runningInstances = $derived(
		runs
			.filter((run) => run.status.state === JobRunState.RUNNING)
			.flatMap((run) => run.instances.nodes.map((node) => node.name))
	);
	const initialInstances = $derived(
		selectedInstance
			? instances.filter((instance) => instance.startsWith(selectedInstance))
			: runningInstances.length > 0
				? runningInstances
				: instances
	);
	const hasLoki = $derived(
		destinations.some((destination) => destination.__typename === 'LogDestinationLoki')
	);
	const grafanaURL = $derived(
		destinations.find((destination) => destination.__typename === 'LogDestinationLoki')?.grafanaURL
	);
</script>

{#key `${team.slug}/${team.environment.environment.name}/${team.environment.job.name}/${selectedInstance ?? ''}`}
	<LokiLogs
		team={team.slug}
		environment={team.environment.environment.name}
		workload={team.environment.job.name}
		container={team.environment.job.name}
		{instances}
		{initialInstances}
		startOnMount={Boolean(selectedInstance) || runningInstances.length > 0}
		{hasLoki}
		{grafanaURL}
		tracesURL={apmURL(page.params.team!, page.params.job!, 'traces')}
	/>
{/key}
