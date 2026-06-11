<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'ApplicationCreatedActivityLogEntry'
			| 'ApplicationDeletedActivityLogEntry'
			| 'ApplicationRestartedActivityLogEntry'
			| 'ApplicationScaledActivityLogEntry'
			| 'ApplicationUpdatedActivityLogEntry'
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		{#if data.__typename === 'ApplicationCreatedActivityLogEntry'}
			App created.
		{:else if data.__typename === 'ApplicationDeletedActivityLogEntry'}
			App deleted.
		{:else if data.__typename === 'ApplicationRestartedActivityLogEntry'}
			App restarted.
		{:else if data.__typename === 'ApplicationScaledActivityLogEntry'}
			{@const size = data.appScaled?.newSize}
			{@const direction = data.appScaled?.direction?.toLowerCase()}
			{#if size != null && direction}
				App scaled {direction} to {size} replicas.
			{:else if size != null}
				App scaled to {size} replicas.
			{:else}
				App scaled.
			{/if}
		{:else if data.__typename === 'ApplicationUpdatedActivityLogEntry'}
			App updated.
			{#if data.applicationUpdated?.changedFields?.length}
				{#each data.applicationUpdated.changedFields as field (field.field)}
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
