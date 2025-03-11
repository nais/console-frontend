<script lang="ts">
	import Deployments from '$lib/components/Deployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { JobDeploys } = $derived(data);
</script>

<GraphErrors errors={$JobDeploys.errors} />

{#if $JobDeploys.data}
	<Deployments workload={$JobDeploys.data.team.environment.workload} />
{/if}
