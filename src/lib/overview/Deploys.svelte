<script lang="ts">
	import { graphql } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { TeamDeploysVariables } from './$houdini';

	export let teamName: string;

	export const _TeamDeploysVariables: TeamDeploysVariables = () => {
		return { team: teamName };
	};

	const store = graphql(`
		query TeamDeploys($team: Slug!) @load {
			team(slug: $team) {
				deployments(limit: 20) {
					pageInfo {
						totalCount
					}
					nodes {
						resources {
							name
							kind
							version
						}
						statuses {
							status
							message
							created
						}
						env
						created
					}
				}
			}
		}
	`);
</script>

{#if $store.errors !== null}
	<Alert variant="error">
		{#each $store.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if $store.data !== null}
	<Table size="small" zebraStripes>
		<Thead>
			<Th>Resource(s)</Th>
			<Th>Created</Th>
			<Th>Cluster</Th>
			<Th>Status</Th>
		</Thead>
		<Tbody>
			{#each $store.data.team.deployments.nodes as { resources, env, created, statuses }}
				<Tr>
					<Td
						>{#each resources as resource}
							<span style="color:var(--a-gray-600)">{resource.kind}:</span>
							{#if resource.kind === 'Application'}
								<a href="/team/{teamName}/{env}/app/{resource.name}/deploys">{resource.name}</a>
							{:else if resource.kind === 'Naisjob'}
								<a href="/team/{teamName}/{env}/job/{resource.name}/deploys">{resource.name}</a>
							{:else}
								{resource.name}
							{/if}
							<br />
						{/each}</Td
					>
					<Td><Time time={created} distance={true} /></Td>
					<Td>
						{env}
					</Td>

					<Td
						>{#if statuses.length === 0}<DeploymentStatus
								status={'unknown'}
							/>{:else}<DeploymentStatus status={statuses[0].status} />{/if}</Td
					>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}
