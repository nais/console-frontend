<script lang="ts">
	import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { page } from '$app/state';
	import { Heading, Loader } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresLogs } = $derived(data);
	let postgres = $derived($PostgresLogs.data?.team.environment.postgres);
</script>

<GraphErrors errors={$PostgresLogs.errors} />
<Heading as="h2" size="small" class="aksel-sr-only">Logs</Heading>

{#if $PostgresLogs.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	{#key postgres.id}
		<LogExplorer
			team={page.params.team!}
			environment={page.params.env!}
			workload={page.params.postgres!}
			tenant={page.data.tenantName ?? ''}
			container="postgres"
			instances={[]}
			postgresId={postgres.id}
			hasLoki={true}
		/>
	{/key}
{/if}
