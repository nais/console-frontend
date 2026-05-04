<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			'PostgresDeletedActivityLogEntry' | 'PostgresGrantAccessActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'PostgresDeletedActivityLogEntry':
				return `Deleted Postgres ${data.resourceName}`;
			case 'PostgresGrantAccessActivityLogEntry':
				return data.postgresGrantAccessData?.grantee
					? `Granted Postgres access to ${data.postgresGrantAccessData.grantee} on ${data.resourceName}`
					: 'Granted Postgres access';
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
