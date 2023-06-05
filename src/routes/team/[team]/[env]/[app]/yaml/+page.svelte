<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { PendingValue } from '$houdini';

	import type { PageData } from './$houdini';
	import Loading from '$lib/Loading.svelte';
	import { page } from '$app/stores';

	export let data: PageData;
	let name = $page.params.app;
	$: ({ AppManifest } = data);
	$: appMan = $AppManifest.data!.app;
</script>

<Card>
	<h3>nais.yaml for {name}</h3>
	{#if appMan.name === PendingValue}
		<Loading height="300px" />
	{:else}
		<pre>{appMan.manifest}</pre>
	{/if}
</Card>
