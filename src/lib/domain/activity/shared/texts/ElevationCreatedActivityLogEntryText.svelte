<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ElevationCreatedActivityLogEntry'>;
	} = $props();

	const formatDuration = (start: string | Date, end: string | Date): string => {
		const startDate = new Date(start);
		const endDate = new Date(end);
		const diffMs = endDate.getTime() - startDate.getTime();
		const diffMinutes = Math.round(diffMs / (1000 * 60));

		if (diffMinutes < 60) {
			return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
		}

		const diffHours = Math.round(diffMinutes / 60);
		return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
	};
</script>

<div>
	<strong>{data.actor}</strong> viewed secret
	<strong>{data.elevationData.targetResourceName}</strong>

	<div class="details">
		<BodyShort size="small">
			<span class="label">Reason:</span>
			{data.elevationData.reason}
		</BodyShort>
		<BodyShort size="small">
			<span class="label">Duration:</span>
			{formatDuration(data.createdAt, data.elevationData.expiresAt)}
		</BodyShort>
	</div>

	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>

<style>
	.details {
		margin: 0.25rem 0;
	}
	.label {
		font-weight: 600;
	}
</style>
