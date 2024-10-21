<script lang="ts">
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';
	import type { TeamDeploysVariables } from './$houdini';
	import {
		ArrowCirclepathIcon,
		BucketIcon,
		QuietZoneIcon,
		SandboxIcon
	} from '@nais/ds-svelte-community/icons';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { graphql } from '$houdini';

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
			{#each $store.data.team.deployments.nodes.slice(0, 8) as { resources, env, created, statuses }}
				<Tr>
					<Td
						>{#each resources as resource}
							{#if resource.kind === 'Application'}
								<Tooltip placement="left" content="Application">
									<span style="color:var(--a-gray-600)"><SandboxIcon {...$$restProps} /> </span>
									<a href="/team/{teamName}/{env}/app/{resource.name}/deploys">{resource.name}</a>
								</Tooltip>
							{:else if resource.kind === 'Naisjob'}
								<Tooltip placement="left" content="Job">
									<span style="color:var(--a-gray-600)"
										><ArrowCirclepathIcon {...$$restProps} />
									</span>
									<a href="/team/{teamName}/{env}/job/{resource.name}/deploys">{resource.name}</a>
								</Tooltip>
							{:else if resource.kind === 'Bucket'}
								<Tooltip placement="left" content="Bucket">
									<span style="color:var(--a-gray-600)"><BucketIcon {...$$restProps} /> </span>
									{resource.name}
								</Tooltip>
							{:else if resource.kind === 'Topic'}
								<Tooltip placement="left" content="Kafka Topic">
									<span style="color:var(--a-gray-600)"><Kafka {...$$restProps} /> </span>
									{resource.name}
								</Tooltip>
							{:else if resource.kind === 'Redis'}
								<Tooltip placement="left" content="Redis">
									<span style="color:var(--a-gray-600)"><Redis {...$$restProps} /> </span>
									{resource.name}
								</Tooltip>
							{:else if resource.kind === 'Secret'}
								<Tooltip placement="left" content="Secret">
									<span style="color:var(--a-gray-600)"><QuietZoneIcon {...$$restProps} /> </span>
									{resource.name}
								</Tooltip>
							{:else}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>{resource.name}
							{/if}
							<br />
						{/each}
					</Td>
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
