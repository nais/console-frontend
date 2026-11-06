<script lang="ts">
	import { Alert } from '#lib/shadcn/ui/index.js';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';

	const {
		team,
		workload,
		projectID
	}: { team: string; workload: string; projectID: string | null } = $props();

	const logsURL = $derived.by(() => {
		if (!projectID) return null;
		const query = [
			`resource.labels.namespace_name=${JSON.stringify(team)}`,
			`resource.labels.container_name=${JSON.stringify(workload)}`
		].join('\n');
		return `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(query)}?project=${encodeURIComponent(projectID)}`;
	});
</script>

<Alert variant="info">
	View Team Logs for this workload in Google Cloud Logs Explorer. Requires configured log forwarding
	from the workload; access alone does not confirm that logs are being sent.
	{#if logsURL}
		<ExternalLink href={logsURL}>Open Team Logs</ExternalLink>
	{:else}
		A direct link is unavailable because this environment has no GCP project ID.
	{/if}
</Alert>
