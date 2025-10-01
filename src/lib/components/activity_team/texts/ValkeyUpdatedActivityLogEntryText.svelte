<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import { resourceTypeToText } from '$lib/components/activity/texts/utils';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, ReadMore, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: 'ValkeyUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<strong>{data.resourceName}</strong> updated in <Tag
		size="small"
		variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag
	>.
	<ReadMore header="Updated fields">
		<dl>
			{#each data.valkeyUpdated.updatedFields as field (field)}
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
		background-color: var(--color-bg-subtle);
		padding: 0.1rem 0.3rem;
		border-radius: 0.3rem;
	}
</style>
