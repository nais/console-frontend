<script lang="ts">
	import Deployments from '$lib/components/Deployments.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { JobDeploys } = $derived(data);
</script>

<GraphErrors errors={$JobDeploys.errors} />

<div class="header">
	<IconWithText icon={RocketIcon} text="Deployments" size="large" />
</div>
{#if $JobDeploys.data}
	<Deployments workload={$JobDeploys.data.team.environment.workload} />
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
