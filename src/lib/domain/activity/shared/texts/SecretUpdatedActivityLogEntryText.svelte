<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'SecretUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();

	const formatFieldName = (field: string): string => {
		if (field.startsWith('value ')) {
			return 'key ' + field.slice('value '.length);
		}

		return field;
	};
</script>

<div>
	Updated Secret <strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if mode === 'full' && data.secretUpdated?.updatedFields?.length}
		{#each data.secretUpdated.updatedFields as field (field.field)}
			<strong>{formatFieldName(field.field)}</strong>
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

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SECRET_UPDATED'
		}}
	/>
</div>
