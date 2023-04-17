<script>
	import Card from '$lib/Card.svelte';
	import { page } from '$app/stores';
	import { teamSpec } from '$lib/mock/team';
	$: team = $page.params.team;
</script>

<Card>
	<h3>{team}</h3>
	<h5>{teamSpec.team.purpose}</h5>
	<h4>
		Slack Channel: {teamSpec.team.slackChannel}
	</h4>
	<h4>Alert channels</h4>
	<ul>
		{#each teamSpec.team.slackAlertsChannels as channel}
			<li>{channel.channelName} ({channel.environment})</li>
		{/each}
	</ul>
</Card>
<br />
<Card><p>Everyting from the console team page</p></Card>
