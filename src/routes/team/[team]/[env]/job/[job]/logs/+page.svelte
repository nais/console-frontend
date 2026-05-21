<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import JobLogs from './JobLogs.svelte';

	let { data }: PageProps = $props();
	let { RunsWithPodNames } = $derived(data);
</script>

<Heading as="h2" size="medium" spacing>Logs</Heading>

{#if $RunsWithPodNames.data}
	<JobLogs team={$RunsWithPodNames.data.team} />
{/if}
