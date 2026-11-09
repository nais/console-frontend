<script lang="ts">
	import { apmURL } from '#lib/doc.js';
	import LegacyLogViewer from '#lib/domain/logs/LegacyLogViewer.svelte';
	import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
	import TeamLogs from '#lib/domain/logs/TeamLogs.svelte';
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
	const hasLegacyLogs = $derived(
		destinations.some((destination) => destination.__typename === 'LogDestinationGeneric')
	);
	const grafanaURL = $derived(
		destinations.find((destination) => destination.__typename === 'LogDestinationLoki')?.grafanaURL
	);
</script>

{#key `${team.slug}/${team.environment.environment.name}/${team.environment.application.name}/${selectedInstance ?? ''}`}
	{#if hasSecureLogs && !hasLoki}
		<div class="detail-actions">
			<TeamLogs
				team={team.slug}
				workload={team.environment.application.name}
				projectID={team.environment.gcpProjectID}
			/>
		</div>
	{/if}
	{#if hasLoki}
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
		>
			{#snippet externalLinks(range)}
				{#if hasSecureLogs}
					<TeamLogs
						team={team.slug}
						workload={team.environment.application.name}
						projectID={team.environment.gcpProjectID}
						{range}
					/>
				{/if}
			{/snippet}
		</LogExplorer>
	{:else if hasLegacyLogs}
		<LegacyLogViewer
			team={team.slug}
			environment={team.environment.environment.name}
			workload={team.environment.application.name}
			{instances}
			initialInstances={selectedInstance ? [selectedInstance] : instances}
			tracesURL={apmURL(page.params.team!, page.params.app!, 'traces')}
		/>
	{:else}
		<Alert variant="info">No standard log destination is configured for this workload.</Alert>
	{/if}
{/key}
