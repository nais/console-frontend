<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { AppManifest } = $derived(data);
</script>

<GraphErrors errors={$AppManifest.errors} />

{#if $AppManifest.data}
	<Manifest workload={$AppManifest.data.team.environment.application} />
{/if}

<style>
</style>
