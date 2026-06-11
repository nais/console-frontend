<script lang="ts">
	import { ReadMore } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'GenericKubernetesResourceActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Applied {data.genericKubernetesData.kind.toLowerCase()}
	<strong>{data.resourceName}</strong>{data.environmentName ? ` in ${data.environmentName}` : ''}.
	{#if mode === 'full' && data.genericKubernetesData.changedFields.length > 0}
		<ReadMore header="Changed fields">
			<dl>
				{#each data.genericKubernetesData.changedFields as field (field.field)}
					<dt>
						<code>{field.field}</code>:
					</dt>
					<dd>
						{#if field.oldValue != null && field.newValue != null}
							<code>{field.oldValue}</code> -> <code>{field.newValue}</code>
						{:else if field.oldValue == null && field.newValue != null}
							set to <code>{field.newValue}</code>
						{:else if field.oldValue != null && field.newValue == null}
							removed (was <code>{field.oldValue}</code>)
						{:else}
							changed
						{/if}
					</dd>
				{/each}
			</dl>
		</ReadMore>
	{/if}

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'GENERIC_KUBERNETES_RESOURCE_CREATED'
		}}
	/>
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
