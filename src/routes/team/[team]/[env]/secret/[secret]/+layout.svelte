<script lang="ts">
	import { page } from '$app/stores';

	$: secretName = $page.params.secret;
	$: env = $page.params.env;
	$: team = $page.params.team;
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<h3>
	<a href="/team/{team}">{team}</a> /
	<a href="/team/{team}/secrets">secrets</a> /
	{env} /
	<i><a href="/team/{team}/{env}/secret/{secretName}">{secretName}</a></i>
</h3>
<slot />
