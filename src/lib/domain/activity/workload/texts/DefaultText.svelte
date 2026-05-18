<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let { data }: { data: WorkloadActivityEntry } = $props();
</script>

<div>
	<BodyLong size="small">
		{data.message || 'Activity recorded.'}
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
