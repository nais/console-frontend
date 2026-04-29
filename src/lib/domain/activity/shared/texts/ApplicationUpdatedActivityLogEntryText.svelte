<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, ReadMore } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ApplicationUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Application
	{#if data.environmentName}
		<a
			href={activityLogResourceLink(
				data.environmentName,
				data.resourceType,
				data.resourceName,
				data.teamSlug
			)}>{data.resourceName}</a
		>
	{:else}
		{data.resourceName}
	{/if}
	updated
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<ReadMore header="Updated fields">
		<dl>
			{#each data.applicationUpdated.changedFields as field (field.field)}
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
		font-family: monospace;
		background-color: var(--ax-bg-neutral-soft);
		padding: 0.1rem 0.3rem;
		border-radius: 0.3rem;
	}
</style>
