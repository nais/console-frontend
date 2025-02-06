<script lang="ts">
	import Card from '$lib/Card.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import TeamDeployments from '$lib/components/TeamDeployments.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Deployments } = $derived(data);
</script>

<GraphErrors errors={$Deployments.errors} />
<div class="header">
	<IconWithText icon={RocketIcon} text="Deployments" size="large" />
</div>
{#if $Deployments.data}
	<Card>
		<TeamDeployments team={$Deployments.data.team} />
	</Card>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
</style>
