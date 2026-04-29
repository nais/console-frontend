<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, ReadMore } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'GenericKubernetesResourceActivityLogEntry'>;
	} = $props();
</script>

<div>
	Applied {data.genericKubernetesData.kind.toLowerCase()} <strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}
	{#if data.genericKubernetesData.changedFields.length > 0}
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
