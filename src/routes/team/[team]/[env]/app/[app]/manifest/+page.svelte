<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { AppManifest } = $derived(data);
</script>

<GraphErrors errors={$AppManifest.errors} />

{#if $AppManifest.data}
	<Manifest workload={$AppManifest.data.team.environment.application} />
{/if}
