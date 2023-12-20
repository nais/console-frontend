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
		query TeamDeploys($team: String!) @load {
			team(name: $team) {
				deployments(first: 20, limit: 20) {
					totalCount
					edges {
						node {
							resources {
								group
								kind
								name
								version
								namespace
							}
							env
							created
							statuses {
								status
								message
								created
							}
							repository
						}
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
	<Table size="small">
		<Thead>
			<Th>Resource(s)</Th>
			<Th>Created</Th>
			<Th>Cluster</Th>
			<Th>Status</Th>
			<!--Th>Link</Th-->
		</Thead>
		<Tbody>
			{#each $store.data.team.deployments.edges as { node: deployment }}
				<Tr>
					<Td
						>{#each deployment.resources as resource}
							<span style="color:var(--a-gray-600)">{resource.kind}:</span>
							{#if resource.kind === 'Application'}
								<a href="/team/{teamName}/{deployment.env}/app/{resource.name}/deploys"
									>{resource.name}</a
								>
							{:else if resource.kind === 'Naisjob'}
								<a href="/team/{teamName}/{deployment.env}/job/{resource.name}/deploys"
									>{resource.name}</a
								>
							{:else}
								{resource.name}
							{/if}
							<br />
						{/each}</Td
					>
					<Td><Time time={deployment.created} distance={true} /></Td>
					<Td>
						{deployment.env}
					</Td>

					<Td
						>{#if deployment.statuses.length === 0}<DeploymentStatus
								status={'unknown'}
							/>{:else}<DeploymentStatus status={deployment.statuses[0].status} />{/if}</Td
					>
					<!--Td>
						{#if deployment.repository}
							<Button
								size="xsmall"
								variant="secondary"
								href="https://github.com/{edge.node.repository}"
								as="a"
							>
								<svelte:fragment slot="icon-left"><BranchingIcon /></svelte:fragment>Repo</Button
							>
						{:else}
							No link
						{/if}
					</Td-->
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}
