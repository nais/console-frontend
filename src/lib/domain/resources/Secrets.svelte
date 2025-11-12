<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { BodyShort, Heading, Loader } from '@nais/ds-svelte-community';
	import { PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '$lib/ui/IconLabel.svelte';

	const secrets = graphql(`
		query WorkloadSecrets($name: String!, $team: Slug!, $env: String!) {
			team(slug: $team) {
				slug
				environment(name: $env) {
					environment {
						name
					}
					workload(name: $name) {
						secrets {
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

	$effect.pre(() => {
		secrets.fetch({
			variables: {
				name: workload,
				team: teamSlug,
				env: environment
			}
		});
	});

	let { environment, workload, teamSlug }: Props = $props();
</script>

<div class="wrapper">
	<Heading level="3" size="small">Secrets</Heading>
	<GraphErrors errors={$secrets.errors} />

	{#if $secrets.fetching}
		<Loader />
	{:else if $secrets.data && $secrets.data.team.environment.workload.secrets.edges.length > 0}
		{#if $secrets.data.team.environment.workload.secrets.edges.length > 0}
			{#each $secrets.data.team.environment.workload.secrets.edges as secret (secret.node.id)}
				<IconLabel
					label={secret.node.name}
					icon={PadlockLockedIcon}
					href="/team/{$secrets.data.team.slug}/{$secrets.data.team.environment.environment
						.name}/secret/{secret.node.name}"
				/>
			{/each}
		{/if}
	{:else}
		<BodyShort>No secrets referenced in nais.yaml.</BodyShort>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		align-items: start;
	}
</style>
