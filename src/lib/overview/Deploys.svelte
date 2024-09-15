<script lang="ts">
	import { graphql } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { TeamDeploysVariables } from './$houdini';
	import { ArrowCirclepathIcon, SandboxIcon } from '@nais/ds-svelte-community/icons';

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
			{#each $store.data.team.deployments.nodes.slice(0, 10) as { resources, env, created, statuses }}
				<Tr>
					<Td
						>{#each resources as resource}
							{#if resource.kind === 'Application'}
								<span style="color:var(--a-gray-600)"><SandboxIcon {...$$restProps} /> </span>
								<a href="/team/{teamName}/{env}/app/{resource.name}/deploys">{resource.name}</a>
							{:else if resource.kind === 'Naisjob'}
								<span style="color:var(--a-gray-600)"
									><ArrowCirclepathIcon {...$$restProps} />
								</span>
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
