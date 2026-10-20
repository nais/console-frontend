<script lang="ts">
	import LokiLogs from '#lib/domain/logs/LokiLogs.svelte';
	import { page } from '$app/state';
</script>

{#key `${page.params.team}/${page.params.env}/${page.params.postgres}`}
	<LokiLogs
		team={page.params.team!}
		environment={page.params.env!}
		workload={page.params.postgres!}
		container="postgres"
		instances={[]}
		initialInstances={[]}
		podNamePrefix={`pg-${page.params.postgres}-`}
		startOnMount={true}
		hasLoki={true}
	/>
{/key}
