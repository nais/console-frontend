<script lang="ts">
	import { fragment, graphql, type WorkloadDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: WorkloadDeployments;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadDeployments on Workload {
					__typename
					name
					team {
						slug
					}
					teamEnvironment {
						environment {
							name
						}
					}
					deployments {
						nodes {
							id
							resources {
								nodes {
									id
									kind
									name
								}
							}
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
							environmentName
							teamSlug
							triggerUrl
							createdAt
							repository
							commitSha
							deployerUsername
						}
					}
				}
			`)
		)
	);
	let deploysOrderedByDate = $derived(
		$data.deployments.nodes.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		})
	);
</script>

{#if $data !== null}
	<Table size="small">
		<Thead>
			<Tr>
				<Th style="width: var(--a-spacing-32);">Resource(s)</Th>
				<Th></Th>
				<Th>Commit</Th>
				<Th>Run</Th>
				<Th>Actor</Th>
				<Th>Environment</Th>
				<Th>Created</Th>
				<Th>Status</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each deploysOrderedByDate as deploy (deploy.id)}
				<Tr>
					<Td>
						{#each deploy.resources.nodes as resource (resource.id)}
							<div style="color:var(--a-gray-600)">{resource.kind}:</div>
						{/each}
					</Td>
					<Td>
						{#each deploy.resources.nodes as resource (resource.id)}
							<div>
								{#if resource.kind === 'Application'}
									<a href="/team/{deploy.teamSlug}/{deploy.environmentName}/app/{resource.name}"
										>{resource.name}</a
									>
								{:else if resource.kind === 'Job' || resource.kind === 'Naisjob'}
									<a href="/team/{deploy.teamSlug}/{deploy.environmentName}/job/{resource.name}"
										>{resource.name}</a
									>
								{:else}
									{resource.name}
								{/if}
							</div>
						{/each}
					</Td>
					<Td>
						{#if deploy.commitSha && isValidSha(deploy.commitSha)}
							<span style="font-family: monospace; font-size: var(--a-font-size-small)">
								<a href="https://github.com/{deploy.repository}/commit/{deploy.commitSha}"
									>{deploy?.commitSha.slice(0, 7)} <ExternalLinkIcon /></a
								>
							</span>
						{/if}
					</Td>
					<Td>
						{#if deploy.triggerUrl}
							<span style=" font-size: var(--a-font-size-small)">
								<a href={deploy.triggerUrl}>Github action <ExternalLinkIcon /></a>
							</span>
						{/if}
					</Td>
					<Td>
						{deploy.deployerUsername}
					</Td>

					<Td>
						{deploy.environmentName}
					</Td>
					<Td><Time time={deploy.createdAt} distance={true} /></Td>
					<Td
						>{#if deploy.statuses.nodes.length === 0}<DeploymentStatus
								status="UNKNOWN"
							/>{:else}<DeploymentStatus status={deploy.statuses.nodes[0].state} />{/if}</Td
					>
				</Tr>
			{:else}
				<Tr>
					<Td colspan={999}>No deployments found</Td>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}
