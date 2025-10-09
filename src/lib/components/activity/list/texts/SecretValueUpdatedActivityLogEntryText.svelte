<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			ActivityLogEntryFragment$data,
			{ __typename: 'SecretValueUpdatedActivityLogEntry' }
		>;
	} = $props();

	const link = $derived(
		activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)
	);
</script>

<div>
	Updated value of <strong>{data.secretValueUpdated?.valueName}</strong> in secret
	<a href={link}><strong>{data.resourceName}</strong></a>

	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
