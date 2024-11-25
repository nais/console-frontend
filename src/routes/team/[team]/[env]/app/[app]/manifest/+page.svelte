<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ AppManifest } = data);
</script>

<GraphErrors errors={$AppManifest.errors} />

{#if $AppManifest.data}
	<Manifest workload={$AppManifest.data.team.environment.application} />
{/if}

<style>
</style>
