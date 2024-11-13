<script lang="ts">
	import { graphql, paginatedFragment, PendingValue, type ImageVulnerabilities } from '$houdini';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ChevronLeftIcon,
		ChevronRightIcon
	} from '@nais/ds-svelte-community/icons';
	import SuppressFinding, { type FindingType } from './SuppressFinding.svelte';
	import TrailFinding from './TrailFinding.svelte';

	export let image: ImageVulnerabilities;
	export let authorized: boolean | typeof PendingValue;

	$: vulnerabilities = paginatedFragment(
		image,
		graphql(`
			fragment ImageVulnerabilities on ContainerImage {
				vulnerabilities(first: 10, orderBy: { field: SEVERITY, direction: DESC })
					@paginate(mode: SinglePage)
					@loading {
					pageInfo @loading {
						hasNextPage
						hasPreviousPage
						pageStart
						pageEnd
						totalCount
					}
					nodes @loading {
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
				workloadReferences @loading {
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
	let analysisTrail: FindingType | undefined;
	let analysisOpen = false;
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
		{#if $vulnerabilities.data}
			{#each $vulnerabilities.data.vulnerabilities.nodes as v}
				{#if v !== PendingValue}
					<Tr>
						<Td>
							{#if authorized}
								<Button
									variant="tertiary"
									size="xsmall"
									on:click={() => {
										findingToSuppress = v;
										suppressOpen = true;
									}}
								>
									<code>{v.identifier}</code>
								</Button>
							{:else}
								<code>{v.identifier}</code>
							{/if}
						</Td>
						<Td><code>{v.package}</code></Td>
						<Td
							><code style="color: {severityToColor(v.severity.toLocaleLowerCase())}"
								>{v.severity}</code
							></Td
						>
						<Td style="text-align: center">
							{#if v.analysisTrail.suppressed}
								<CheckmarkIcon width={'18px'} height={'18px'} />
							{/if}
						</Td>
						<Td>
							<Button
								variant="tertiary-neutral"
								size="small"
								disabled={v.analysisTrail?.state ? false : true}
								on:click={() => {
									analysisTrail = v;
									analysisOpen = true;
								}}
							>
								<code>{v.analysisTrail?.state ? v.analysisTrail?.state : 'N/A'} </code>
							</Button>
						</Td>
					</Tr>
				{:else}
					<Tr>
						<Td><Skeleton variant="rectangle" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="text" /></Td>
						<Td><Skeleton variant="rectangle" /></Td>
					</Tr>
				{/if}
			{:else}
				<Tr>
					<Td colspan={999}>No vulnerabilities</Td>
				</Tr>
			{/each}
		{/if}
	</Tbody>
</Table>
{#if $vulnerabilities.data?.vulnerabilities.pageInfo !== PendingValue && ($vulnerabilities.data?.vulnerabilities.pageInfo.hasPreviousPage || $vulnerabilities.data?.vulnerabilities.pageInfo.hasNextPage)}
	<div class="pagination">
		<span>
			{#if $vulnerabilities.data?.vulnerabilities.pageInfo.pageStart !== $vulnerabilities.data?.vulnerabilities.pageInfo.pageEnd}
				{$vulnerabilities.data?.vulnerabilities.pageInfo.pageStart} - {$vulnerabilities.data
					?.vulnerabilities.pageInfo.pageEnd}
			{:else}
				{$vulnerabilities.data?.vulnerabilities.pageInfo.pageStart}
			{/if}

			of {$vulnerabilities.data?.vulnerabilities.pageInfo.totalCount}
		</span>

		<span style="padding-left: 1rem;">
			<Button
				size="small"
				variant="secondary"
				disabled={!$vulnerabilities.data?.vulnerabilities.pageInfo.hasPreviousPage}
				on:click={async () => {
					return await vulnerabilities.loadPreviousPage();
				}}><ChevronLeftIcon /></Button
			>
			<Button
				size="small"
				variant="secondary"
				disabled={!$vulnerabilities.data?.vulnerabilities.pageInfo.hasNextPage}
				on:click={() => {
					vulnerabilities.loadNextPage();
				}}
			>
				<ChevronRightIcon /></Button
			>
		</span>
	</div>
{/if}

{#if findingToSuppress && image && authorized !== PendingValue && authorized && $vulnerabilities.data.workloadReferences !== PendingValue}
	{#key findingToSuppress.id}
		<SuppressFinding
			bind:open={suppressOpen}
			finding={findingToSuppress}
			workloads={$vulnerabilities.data.workloadReferences.nodes.map((node) => node.workload)}
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

{#if analysisTrail && image && authorized !== PendingValue && authorized && $vulnerabilities.data.workloadReferences !== PendingValue}
	<TrailFinding
		bind:open={analysisOpen}
		finding={analysisTrail}
		workloads={$vulnerabilities.data.workloadReferences.nodes.map((node) => node.workload)}
		on:close={() => {
			analysisTrail = undefined;
		}}
	/>
{/if}

<style>
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}

	code {
		font-size: 0.8rem;
	}
</style>
