<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	type BranchEntry =
		| ActivityLogEntry<'PostgresBranchCreatedActivityLogEntry'>
		| ActivityLogEntry<'PostgresBranchActivatedActivityLogEntry'>
		| ActivityLogEntry<'PostgresBranchDeletedActivityLogEntry'>;

	let { data, mode }: { data: BranchEntry; mode?: TimelineModes } = $props();

	const operations = {
		PostgresBranchCreatedActivityLogEntry: {
			label: 'created',
			activityType: 'POSTGRES_BRANCH_CREATED'
		},
		PostgresBranchActivatedActivityLogEntry: {
			label: 'activated',
			activityType: 'POSTGRES_BRANCH_ACTIVATED'
		},
		PostgresBranchDeletedActivityLogEntry: {
			label: 'deleted',
			activityType: 'POSTGRES_BRANCH_DELETED'
		}
	} as const;

	const operation = $derived(operations[data.__typename as keyof typeof operations]);
	const recovery = $derived('sourceBranch' in data.postgresBranch ? data.postgresBranch : null);
	const targetTime = $derived(recovery?.targetTime?.toISOString());
</script>

<div>
	Branch <strong>{data.postgresBranch.branch}</strong>
	{operation.label}
	on Postgres <strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if recovery?.sourceBranch}
		Source: <strong>{recovery.sourceBranch}</strong>.
	{/if}
	{#if targetTime}
		Recovered to <time datetime={targetTime}
			>{targetTime.replace('T', ' ').replace('.000Z', ' UTC')}</time
		>.
	{/if}
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: operation.activityType }}
	/>
</div>
