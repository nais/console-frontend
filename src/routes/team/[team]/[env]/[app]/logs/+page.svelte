<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { appSpec } from '$lib/mock/appSpec';
	$: app = $page.params.app;
</script>

<Card>
	<h3>Logs for {app}</h3>
	{#each appSpec.logs as log}
		<p>
			{log}
		</p>
	{/each}
</Card>

<style>
	p {
		line-break: anywhere;
		overflow-wrap: break-word;
		font-family: monospace;
	}
</style>
