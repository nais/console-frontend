<script lang="ts">
	import { BodyShort } from '#lib/shadcn/ui/index.js';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import { teamLogsURL } from './logLinks.js';
	import type { LogRange } from './loki.js';

	const {
		team,
		workload,
		projectID,
		range
	}: { team: string; workload: string; projectID: string | null; range?: LogRange } = $props();

	const logsURL = $derived(projectID ? teamLogsURL(projectID, team, workload, range) : null);
</script>

{#if logsURL}
	<ExternalLink href={logsURL}>Open Team Logs</ExternalLink>
{:else}
	<BodyShort size="small"
		>A direct link is unavailable because this environment has no GCP project ID.</BodyShort
	>
{/if}
