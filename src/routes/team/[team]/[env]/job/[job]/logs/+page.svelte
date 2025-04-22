<script lang="ts">
	import type { PageProps } from './$houdini';
	import JobLogs from './JobLogs.svelte';

	let { data }: PageProps = $props();
	let { RunsWithPodNames } = $derived(data);
</script>

{#if $RunsWithPodNames.data}
	<JobLogs team={$RunsWithPodNames.data.team} />
{/if}
