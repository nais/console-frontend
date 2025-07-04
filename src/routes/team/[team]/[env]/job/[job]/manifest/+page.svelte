<script lang="ts">
	import Manifest from '$lib/components/Manifest.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { JobManifest } = $derived(data);
</script>

<GraphErrors errors={$JobManifest.errors} />

{#if $JobManifest.data}
	<div class="wrapper">
		<Manifest workload={$JobManifest.data.team.environment.workload} />
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		max-width: 1230px;
		gap: 1rem;
	}
</style>
