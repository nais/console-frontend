<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, ReadMore, Tag } from '@nais/ds-svelte-community';
	import { resourceTypeToText } from '../../sidebar/texts/utils';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'OpenSearchUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<a
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	updated
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}.
	<ReadMore header="Updated fields">
		<dl>
			{#each data.opensearchData.updatedFields as field (field)}
				<dt>
					<code>{field.field}</code>:
				</dt>
				<dd>
					<code>{field.oldValue}</code> -> <code>{field.newValue}</code>
				</dd>
			{/each}
		</dl>
	</ReadMore>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>

<style>
	dl {
		display: grid;
		grid-template-columns: max-content auto;
		gap: 0 0.5rem;
		margin: 0.5rem 0;
	}
	code {
		font-family: 'Courier New', Courier, monospace;
		background-color: var(--ax-bg-neutral-soft);
		padding: 0.1rem 0.3rem;
		border-radius: 0.3rem;
	}
</style>
