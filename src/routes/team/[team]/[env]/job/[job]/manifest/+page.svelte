<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { JobManifest } = $derived(data);
</script>

<GraphErrors errors={$JobManifest.errors} />

{#if $JobManifest.data}
	<Manifest workload={$JobManifest.data.team.environment.job} />
{/if}
