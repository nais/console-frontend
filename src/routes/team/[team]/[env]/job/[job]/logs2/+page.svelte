<script lang="ts">
	import { Heading } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';
	import JobLogs2 from './JobLogs2.svelte';

	let { data }: PageProps = $props();
	let { RunsWithPodNames } = $derived(data);
</script>

<Heading as="h2" size="medium" spacing>Logs (Loki test)</Heading>

{#if $RunsWithPodNames.data}
	<JobLogs2 team={$RunsWithPodNames.data.team} />
{/if}
