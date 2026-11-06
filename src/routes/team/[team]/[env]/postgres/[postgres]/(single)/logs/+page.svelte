<script lang="ts">
	import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { formatPostgresLogInstance } from '#lib/utils/logViewer.js';
	import { page } from '$app/state';
	import { BodyShort, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresLogs } = $derived(data);
	let postgres = $derived($PostgresLogs.data?.team.environment.postgres);
	let branch = $derived(postgres?.activeBranch?.name ?? '');
</script>

<GraphErrors errors={$PostgresLogs.errors} />
<Heading as="h2" size="small" class="aksel-sr-only">Logs</Heading>

{#if $PostgresLogs.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres && branch}
	{#key `${page.params.team}/${page.params.env}/${page.params.postgres}/${branch}`}
		<LogExplorer
			team={page.params.team!}
			environment={page.params.env!}
			workload={page.params.postgres!}
			tenant={page.data.tenantName ?? ''}
			container="postgres"
			instances={[]}
			podNamePrefix={`pg-${page.params.postgres}-${branch}-`}
			exactPostgresBranch={true}
			formatInstanceName={(instance) => formatPostgresLogInstance(instance, page.params.postgres!)}
			hasLoki={true}
		/>
	{/key}
{:else if postgres}
	<BodyShort>Logs are not available until Postgres has an active branch.</BodyShort>
{/if}
