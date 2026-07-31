<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import { RobotIcon } from '@nais/ds-svelte-community/icons';

	const binding = graphql(`
		query WorkloadServiceAccount($name: String!, $team: Slug!, $env: String!) {
			team(slug: $team) {
				environment(name: $env) {
					workload(name: $name) {
						serviceAccount {
							id
							name
							team {
								slug
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
		binding.fetch({
			variables: {
				name: workload,
				team: teamSlug,
				env: environment
			}
		});
	});

	const serviceAccount = $derived($binding.data?.team.environment.workload.serviceAccount);
</script>

<GraphErrors errors={$binding.errors} />

{#if $binding.fetching}
	<SurfaceCard title="Service account">
		<Loader />
	</SurfaceCard>
{:else if serviceAccount}
	<SurfaceCard title="Service account">
		<IconLabel
			label={serviceAccount.name}
			icon={RobotIcon}
			href={serviceAccount.team
				? `/team/${serviceAccount.team.slug}/settings/service_accounts/${serviceAccount.id}`
				: undefined}
		/>
	</SurfaceCard>
{/if}
