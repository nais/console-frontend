<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'UnleashInstanceCreatedActivityLogEntry'
			| 'UnleashInstanceDeletedActivityLogEntry'
			| 'UnleashInstanceUpdatedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'UnleashInstanceCreatedActivityLogEntry':
				return `Created Unleash instance ${data.resourceName}`;
			case 'UnleashInstanceDeletedActivityLogEntry':
				return `Deleted Unleash instance ${data.resourceName}`;
			case 'UnleashInstanceUpdatedActivityLogEntry':
				if (data.unleashInstanceUpdated?.allowedTeamSlug) {
					return `Allowed team ${data.unleashInstanceUpdated.allowedTeamSlug} to access ${data.resourceName}`;
				}

				if (data.unleashInstanceUpdated?.revokedTeamSlug) {
					return `Revoked team ${data.unleashInstanceUpdated.revokedTeamSlug} from ${data.resourceName}`;
				}

				if (data.unleashInstanceUpdated?.updatedReleaseChannel) {
					return `Changed release channel for ${data.resourceName} to ${data.unleashInstanceUpdated.updatedReleaseChannel}`;
				}

				return `Updated Unleash instance ${data.resourceName}`;
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
