<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import { FileTextIcon } from '@nais/ds-svelte-community/icons';

	const configs = graphql(`
		query WorkloadConfigs($name: String!, $team: Slug!, $env: String!) {
			team(slug: $team) {
				slug
				environment(name: $env) {
					environment {
						name
					}
					workload(name: $name) {
						configs {
							edges {
								node {
									id
									name
								}
							}
						}
					}
				}
			}
		}
	`);

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();

	$effect(() => {
		configs.fetch({
			variables: {
				name: workload,
				team: teamSlug,
				env: environment
			}
		});
	});
</script>

<GraphErrors errors={$configs.errors} />

{#if $configs.fetching}
	<SurfaceCard title="Configs">
		<Loader />
	</SurfaceCard>
{:else if $configs.data && $configs.data.team.environment.workload.configs.edges.length > 0}
	<SurfaceCard title="Configs">
		<div class="list">
			{#each $configs.data.team.environment.workload.configs.edges as config (config.node.id)}
				<IconLabel
					label={config.node.name}
					icon={FileTextIcon}
					href="/team/{$configs.data.team.slug}/{$configs.data.team.environment.environment
						.name}/config/{config.node.name}"
				/>
			{/each}
		</div>
	</SurfaceCard>
{/if}

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		align-items: start;
	}
</style>
