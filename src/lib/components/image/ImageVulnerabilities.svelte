<script lang="ts">
	import { graphql, ImageVulnerabilityOrderField, PendingValue } from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import {
		Button,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon } from '@nais/ds-svelte-community/icons';
	import { untrack } from 'svelte';
	import type { ImageVulnerabilitiesVariables } from './$houdini';
	import SuppressFinding, { type FindingType } from './SuppressFinding.svelte';
	import TrailFinding from './TrailFinding.svelte';

	interface Props {
		authorized: boolean | typeof PendingValue;
		team: string | typeof PendingValue;
		environment: string | typeof PendingValue;
		workload: string | typeof PendingValue;
	}

	let { authorized, team, environment, workload }: Props = $props();

	export const _ImageVulnerabilitiesVariables: ImageVulnerabilitiesVariables = () => {
		return untrack(() => {
			if (team === PendingValue || environment === PendingValue || workload === PendingValue) {
				return { team: '', environment: '', workload: '' };
			}
			return {
				workload: workload,
				environment: environment,
				team: team,
				orderBy: {
					field: tableSort.orderBy ? tableSort.orderBy : ImageVulnerabilityOrderField.SEVERITY,
					direction: tableSort.direction ? tableSort.direction : 'ASC'
				}
			};
		});
	};

	const vulnerabilities = graphql(`
		query ImageVulnerabilities(
			$team: Slug!
			$environment: String!
			$workload: String!
			$orderBy: ImageVulnerabilityOrder
		) @load {
			team(slug: $team) {
				environment(name: $environment) {
					workload(name: $workload) {
						__typename
						image {
							vulnerabilities(first: 10, orderBy: $orderBy) @paginate(mode: SinglePage) {
								pageInfo {
									hasNextPage
									hasPreviousPage
									pageStart
									pageEnd
									endCursor
									startCursor
									totalCount
								}
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
							workloadReferences(first: 999) {
								nodes {
									workload {
										id
										__typename
										team {
											slug
										}
										teamEnvironment {
											environment {
												name
											}
										}
										name
									}
								}
							}
						}
					}
				}
			}
		}
	`);

	let findingToSuppress: FindingType | undefined = $state();
	let suppressOpen = $state(false);
	let analysisTrail: FindingType | undefined = $state();
	let analysisOpen = $state(false);

	let image = $derived($vulnerabilities.data?.team.environment.workload.image);

	let tableSort = $derived({
		orderBy: $vulnerabilities.variables?.orderBy?.field,
		direction: $vulnerabilities.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy =
				ImageVulnerabilityOrderField[key as keyof typeof ImageVulnerabilityOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams(
			{
				direction: tableSort.direction || 'DESC',
				field: tableSort.orderBy || ImageVulnerabilityOrderField.SEVERITY
			},
			{ noScroll: true }
		);

		if (team !== PendingValue && environment !== PendingValue && workload !== PendingValue) {
			vulnerabilities.fetch({
				variables: {
					team: team,
					environment: environment,
					workload: workload,
					orderBy: {
						field: tableSort.orderBy || ImageVulnerabilityOrderField.SEVERITY,
						direction: tableSort.direction || 'DESC'
					}
				}
			});
		}
	};
</script>

<Heading level="2" size="medium" spacing>Vulnerabilities</Heading>
{#if $vulnerabilities.data}
	<Table
		size="small"
		sort={{
			orderBy: tableSort.orderBy || ImageVulnerabilityOrderField.SEVERITY,
			direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
		}}
		onsortchange={tableSortChange}
	>
		<Thead>
			<Tr>
				<Th style="width: 13rem" sortable={true} sortKey={ImageVulnerabilityOrderField.IDENTIFIER}
					>ID</Th
				>
				<Th sortable={true} sortKey={ImageVulnerabilityOrderField.PACKAGE}>Package</Th>
				<Th style="width: 7rem " sortable={true} sortKey={ImageVulnerabilityOrderField.SEVERITY}
					>Severity</Th
				>
				<Th style="width: 3rem" sortable={true} sortKey={ImageVulnerabilityOrderField.SUPPRESSED}
					>Suppressed</Th
				>
				<Th sortable={true} sortKey={ImageVulnerabilityOrderField.STATE}>State</Th>
			</Tr>
		</Thead>
		<Tbody>
			{@const vulnz = $vulnerabilities.data.team.environment.workload.image.vulnerabilities.nodes}
			{#each vulnz as v (v)}
				<Tr>
					<Td>
						<!--{#if authorized}-->
						<Button
							variant="tertiary"
							size="xsmall"
							onclick={() => {
								findingToSuppress = v;
								suppressOpen = true;
							}}
						>
							<code>{v.identifier}</code>
						</Button>
						<!--{:else}
							<code>{v.identifier}</code>
						{/if}-->
					</Td>
					<Td><code>{v.package}</code></Td>
					<Td
						><code
							style="color: {severityToColor({
								severity: v.severity.toLowerCase(),
								isText: true
							})}">{v.severity}</code
						></Td
					>
					<Td style="text-align: center">
						{#if v.analysisTrail.suppressed}
							<CheckmarkIcon width="18px" height="18px" />
						{/if}
					</Td>
					<Td>
						<Button
							variant="tertiary-neutral"
							size="small"
							disabled={v.analysisTrail?.state ? false : true}
							onclick={() => {
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
					<Td colspan={999}>No vulnerabilities</Td>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{:else}
	<div style="display: flex; justify-content: center; align-items: center; height: 200px;">
		<Loader size="2xlarge" />
	</div>
{/if}

{#if image}
	<Pagination
		page={image.vulnerabilities.pageInfo}
		loaders={{
			loadPreviousPage: () => {
				vulnerabilities.loadPreviousPage();
			},
			loadNextPage: () => {
				vulnerabilities.loadNextPage();
			}
		}}
	/>

	{#if findingToSuppress && authorized !== PendingValue && image.workloadReferences}
		{#key findingToSuppress.id}
			<SuppressFinding
				bind:open={suppressOpen}
				finding={findingToSuppress}
				workloads={image.workloadReferences.nodes.map((node) => node.workload)}
				{authorized}
				on:close={() => {
					findingToSuppress = undefined;
				}}
			/>
		{/key}
	{/if}

	{#if analysisTrail && authorized !== PendingValue && authorized && image.workloadReferences}
		<TrailFinding
			bind:open={analysisOpen}
			finding={analysisTrail}
			workloads={image.workloadReferences.nodes.map((node) => node.workload)}
			on:close={() => {
				analysisTrail = undefined;
			}}
		/>
	{/if}
{/if}

<style>
	code {
		font-size: 0.8rem;
	}
</style>
