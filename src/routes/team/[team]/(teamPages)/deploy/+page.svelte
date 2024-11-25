<script lang="ts">
	import Card from '$lib/Card.svelte';
	import TeamDeployments from '$lib/components/TeamDeployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Deployments } = data);
</script>

<GraphErrors errors={$Deployments.errors} />

{#if $Deployments.data}
	<Card>
		<TeamDeployments team={$Deployments.data.team} />
	</Card>
{/if}
