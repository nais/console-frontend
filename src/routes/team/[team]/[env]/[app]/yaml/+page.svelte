<script lang="ts">
	import Card from '$lib/Card.svelte';

	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ AppManifest } = data);
</script>

{#if $AppManifest.data}
	<Card>
		<h3>nais.yaml for {$AppManifest.data.app.name}</h3>
		<pre>{$AppManifest.data.app.manifest}</pre>
	</Card>
{/if}
