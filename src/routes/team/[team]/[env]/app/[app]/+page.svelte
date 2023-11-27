<script lang="ts">
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import type { CurrentResourceUtilizationForAppVariables, PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import AutoScaling from './AutoScaling.svelte';
	import Image from './Image.svelte';
	import Instances from './Instances.svelte';
	import Status from './Status.svelte';
	import Storage from './Storage.svelte';
	import Traffic from './Traffic.svelte';

	export let data: PageData;
	$: ({ App } = data);

	export const _CurrentResourceUtilizationForAppVariables: CurrentResourceUtilizationForAppVariables =
		() => {
			return { app: app, env: env, team: team };
		};

	const utilization = graphql(`
		query CurrentResourceUtilizationForApp($app: String!, $team: String!, $env: String!) @load {
			currentResourceUtilizationForApp(app: $app, team: $team, env: $env) @loading {
				cpu {
					utilization
					request
				}
				memory {
					utilization
					request
				}
			}
		}
	`);

	$: app = $page.params.app;
	$: env = $page.params.env;
	$: team = $page.params.team;
	$: appUtilization = $utilization.data?.currentResourceUtilizationForApp;
</script>

{#if $App.data}
	<div class="grid">
		<Status app={$App.data.app} />

		<Card columns={9} rows={2}>
			<Image app={$App.data.app} />
		</Card>
		<Card columns={3} rows={1}>
			<Cost {app} {env} {team} />
		</Card>
		<Card columns={12}>
			<h4>Instances</h4>
			<AutoScaling app={$App.data.app} />
			<Instances app={$App.data.app} utilization={appUtilization} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic app={$App.data.app} />
		</Card>
		<Card columns={4}>
			<h4>Storage</h4>
			<Storage app={$App.data.app} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications app={$App.data.app} />
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
</style>
