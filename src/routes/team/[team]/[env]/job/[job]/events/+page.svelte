<script lang="ts">
	import WorkloadEventsPage from '#lib/domain/workload/WorkloadEventsPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { JobWorkloadEvents } = $derived(data);
</script>

<WorkloadEventsPage
	events={$JobWorkloadEvents.data?.team.environment?.job?.events}
	fetching={$JobWorkloadEvents.fetching}
	failed={Boolean($JobWorkloadEvents.errors?.length)}
	job
/>
