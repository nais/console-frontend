<script lang="ts">
	import Card from '$lib/Card.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ TeamSettings } = data);
	$: teamSettings = $TeamSettings.data?.team;
</script>

<Card>
	{#if teamSettings}
		<h3>{teamSettings.name}</h3>
		<h5>{teamSettings.description}</h5>
		<h4>Slack Channel: {teamSettings.slackChannel}</h4>
		<h4>Alert channels</h4>
		<dl>
			{#each teamSettings.slackAlertsChannels as channel}
				<dt>{channel.env}:</dt>
				<dd>{teamSettings.slackChannel}</dd>
			{:else}
				<dt>Warning:</dt>
				<dd>No alert channels</dd>
			{/each}
		</dl>
	{/if}
</Card>
<br />
<Card>
	<h4>Deploy key</h4>
	<dl>
		<dt>Created:</dt>
		<dd>{teamSettings?.deployKey?.created}</dd>
		<dt>Expires:</dt>
		<dd>{teamSettings?.deployKey?.expires}</dd>
		<dt>Key:</dt>
		<dd>{teamSettings?.deployKey?.key}</dd>
	</dl>
</Card>

<style>
	dt {
		font-weight: bold;
	}
</style>
