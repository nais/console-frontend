<script lang="ts">
	import WorkloadEventsPage from '#lib/domain/workload/WorkloadEventsPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { AppWorkloadEvents } = $derived(data);
</script>

<WorkloadEventsPage
	events={$AppWorkloadEvents.data?.team.environment?.application?.events}
	fetching={$AppWorkloadEvents.fetching}
	failed={Boolean($AppWorkloadEvents.errors?.length)}
/>
