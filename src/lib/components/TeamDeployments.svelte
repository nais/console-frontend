<script lang="ts">
	import { fragment, graphql, type TeamDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { isValidSha } from '$lib/utils/isValidSha';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import ExternalLink from './ExternalLink.svelte';

	interface Props {
		team: TeamDeployments;
	}

	let { team }: Props = $props();

	let data = $derived(
		fragment(
			team,
			graphql(`
				fragment TeamDeployments on Team {
					deployments {
						nodes {
							id
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
							resources {
								nodes {
									id
									kind
									name
								}
							}
							environmentName
							createdAt
							teamSlug
							commitSha
							repository
							deployerUsername
							triggerUrl
						}
					}
				}
			`)
		)
	);
</script>

<Table size="small">
	<Thead>
		<Tr>
			<Th style="width: var(--ax-space-128);">Resource(s)</Th>
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
		{#if $data !== null}
			{@const deploys = $data.deployments.nodes}
			{#each deploys as deploy (deploy.id)}
				<Tr>
					<Td>
						{#each deploy.resources.nodes as resource (resource.id)}
							<div style="color:var(--ax-neutral-600)">{resource.kind}:</div>
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
							<span style="font-family: monospace; font-size: var(--ax-font-size-small)">
								<ExternalLink
									href="https://github.com/{deploy.repository}/commit/{deploy.commitSha}"
									>{deploy?.commitSha.slice(0, 7)}</ExternalLink
								>
							</span>
						{/if}
					</Td>
					<Td>
						{#if deploy.triggerUrl}
							<span style=" font-size: var(--ax-font-size-small)">
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
		{/if}
	</Tbody>
</Table>
