<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			ActivityLogEntryFragment$data,
			{ __typename: 'RepositoryRemovedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<a href="/team/{data.teamSlug}/repositories">Repository</a>
	<strong>{data.resourceName}</strong> removed from team {data.teamSlug}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
