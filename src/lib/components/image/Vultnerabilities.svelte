<script lang="ts">
	import { fragment, graphql, type ImageVulnerabilities } from '$houdini';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { CheckmarkIcon } from '@nais/ds-svelte-community/icons';
	import SuppressFinding, { type FindingType } from './SuppressFinding.svelte';

	export let image: ImageVulnerabilities;
	export let authorized: boolean;
	export let user: string;

	$: vulnerabilities = fragment(
		image,
		graphql(`
			fragment ImageVulnerabilities on ContainerImage {
				vulnerabilities {
					nodes {
						id
						description
						identifier
						package
						severity
						state
						analysisTrail {
							state
							suppressed
							comments {
								nodes {
									comment
									onBehalfOf
									state
									suppressed
									timestamp
								}
							}
						}
					}
				}
				workloadReferences {
					nodes {
						workload {
							__typename
							team {
								slug
							}
							environment {
								name
							}
							name
							deploymentInfo {
								url
								timestamp
							}
						}
					}
				}
			}
		`)
	);

	let findingToSuppress: FindingType | undefined;
	let suppressOpen = false;
</script>

<h4>Vulnerabilities</h4>
<Table zebraStripes size="small">
	<Thead>
		<Th style="width: 12rem" sortable={true} sortKey="NAME">ID</Th>
		<Th style="width: 38rem" sortable={true} sortKey="PACKAGE_URL">Package</Th>
		<Th style="width: 7rem " sortable={true} sortKey="SEVERITY">Severity</Th>
		<Th style="width: 3rem" sortable={true} sortKey="IS_SUPPRESSED">Suppressed</Th>
		<Th sortable={true} sortKey="STATE">State</Th>
	</Thead>
	<Tbody>
		{#each $vulnerabilities.vulnerabilities.nodes as finding}
			<Tr>
				<Td>
					{#if authorized}
						<Button
							variant="tertiary"
							size="xsmall"
							on:click={() => {
								findingToSuppress = finding;
								suppressOpen = true;
							}}
						>
							<code>{finding.identifier}</code>
						</Button>
					{:else}
						<code>{finding.identifier}</code>
					{/if}
				</Td>
				<Td><code>{finding.package}</code></Td>
				<Td
					><code style="color: {severityToColor(finding.severity.toLocaleLowerCase())}"
						>{finding.severity}</code
					></Td
				>
				<Td style="text-align: center">
					{#if finding.analysisTrail.suppressed}
						<CheckmarkIcon width={'18px'} height={'18px'} />
					{/if}
				</Td>
				<Td>
					<Button
						variant="tertiary-neutral"
						size="small"
						disabled={finding.analysisTrail?.state ? false : true}
						on:click={() => {
							//analysisTrail = finding;
							//analysisOpen = true;
						}}
					>
						<code>{finding.analysisTrail?.state ? finding.analysisTrail?.state : 'N/A'} </code>
					</Button>
				</Td>
			</Tr>
		{:else}
			<Tr>
				<Td colspan={999}>No vulnerabilities</Td>
			</Tr>
		{/each}
	</Tbody>
</Table>

{#if findingToSuppress && image && authorized}
	{#key findingToSuppress.id}
		<SuppressFinding
			bind:open={suppressOpen}
			finding={findingToSuppress}
			workloads={$vulnerabilities.workloadReferences.nodes.map((node) => node.workload)}
			{user}
			{authorized}
			on:close={() => {
				findingToSuppress = undefined;
				setTimeout(() => {
					// refetch the image to update the findings
					/*summary.fetch({
						variables: { env: env, team: team, app: appName },
						policy: 'NetworkOnly'
					});*/
					console.log('Refetching image');
				}, 2000);
			}}
		/>
	{/key}
{/if}
