<script lang="ts">
	import Deployments from '$lib/components/Deployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { JobDeploys } = $derived(data);
</script>

<GraphErrors errors={$JobDeploys.errors} />

{#if $JobDeploys.data}
	<Deployments workload={$JobDeploys.data.team.environment.workload} />
{/if}
