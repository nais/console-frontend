<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import { Skeleton } from '@nais/ds-svelte-community';
	import LogLine from '../LogLine.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ TeamAuditLogs } = data);
	$: ({ limit, offset } = limitOffset($TeamAuditLogs.variables));
</script>

{#if $TeamAuditLogs.data}
	<Card>
		<h3>Audit logs</h3>

		{#each $TeamAuditLogs.data.team.auditLogs.nodes || [] as log}
			{#if log !== PendingValue}
				<LogLine {log} />
			{:else}
				<Skeleton variant="text" />
			{/if}
		{:else}
			<p>No audit logs</p>
		{/each}

		<Pagination
			pageInfo={$TeamAuditLogs.data.team.auditLogs.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
			}}
		/>
	</Card>
{/if}
