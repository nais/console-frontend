<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'JobCreatedActivityLogEntry'
			| 'JobDeletedActivityLogEntry'
			| 'JobRunDeletedActivityLogEntry'
			| 'JobTriggeredActivityLogEntry'
			| 'JobUpdatedActivityLogEntry'
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		{#if data.__typename === 'JobCreatedActivityLogEntry'}
			Job created.
		{:else if data.__typename === 'JobDeletedActivityLogEntry'}
			Job deleted.
		{:else if data.__typename === 'JobRunDeletedActivityLogEntry'}
			{#if data.jobRunDeletedData?.runName}
				Run <strong>{data.jobRunDeletedData.runName}</strong> deleted.
			{:else}
				Run deleted.
			{/if}
		{:else if data.__typename === 'JobTriggeredActivityLogEntry'}
			Job triggered.
		{:else if data.__typename === 'JobUpdatedActivityLogEntry'}
			Job updated.
			{#if data.jobUpdated?.changedFields?.length}
				{#each data.jobUpdated.changedFields as field (field.field)}
					<strong>{field.field}</strong>
					{#if field.oldValue != null && field.newValue != null}
						changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
					{:else if field.oldValue == null && field.newValue != null}
						set to <i>{field.newValue}</i>.
					{:else if field.oldValue != null && field.newValue == null}
						removed (was <i>{field.oldValue}</i>).
					{:else}
						changed.
					{/if}
				{/each}
			{/if}
		{/if}
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
