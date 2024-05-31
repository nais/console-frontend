<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import SuppressFinding, { type FindingType } from '$lib/components/image/SuppressFinding.svelte';
	import TrailFinding from '$lib/components/image/TrailFinding.svelte';
	import Workloads from '$lib/components/image/Workloads.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { parseImage } from '$lib/utils/image';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import {
		Alert,
		Button,
		CopyButton,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon, ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Image, UserInfo } = data);

	$: image = $Image.data?.app.image;
	$: user = UserInfo.data?.me.__typename == 'User' ? UserInfo.data?.me.name : '';

	const summary = graphql(`
		query Summary($env: String!, $team: Slug!, $app: String!) {
			app(env: $env, team: $team, name: $app) {
				image {
					projectId
					summary {
						riskScore
						critical
						high
						medium
						low
						unassigned
					}
				}
			}
		}
	`);

	const notificationBadgeSize = '48px';

	let appName = $page.params.app;
	let env = $page.params.env;
	let team = $page.params.team;

	let registry: string;
	let repository: string;
	let name: string;
	let tag: string;
	let findingToSuppress: FindingType | undefined;
	let suppressOpen = false;
	let analysisTrail: FindingType | undefined;
	let analysisOpen = false;

	$: {
		if (image && image.id !== PendingValue) {
			({ registry, repository, name, tag } = parseImage(image.name));
		}
	}

	$: ({ sortState, limit, offset } = tableStateFromVariables($Image.variables));
</script>

{#if $Image.errors}
	<Alert variant="error">
		<p>{$Image.errors[0].message}</p>
	</Alert>
{/if}
{#if image}
	<div class="grid">
		{#if image.id !== PendingValue}
			<Card columns={8}>
				<h4 class="imageHeader">
					Image details
					<CopyButton
						size="xsmall"
						variant="action"
						text="Copy image name"
						activeText="Image name copied"
						copyText={image.name}
					/>
				</h4>
				<div class="imageGrid">
					<div class="registry">
						<h5>Registry</h5>
						<code>{registry}</code>
					</div>
					<div class="repository">
						<h5>Repository</h5>
						<code>{repository}</code>
					</div>
					<div class="imageName">
						<h5>Name</h5>
						<code>{name}</code>
					</div>
					<div class="tag">
						<h5>Tag</h5>
						<code>{tag}</code>
					</div>
					<div class="commitSha">
						<h5>Commit</h5>
						<code>Kommer...</code>
					</div>

					<div class="rekor">
						<a href="https://search.sigstore.dev/?logIndex={image.rekor.logIndex}">
							Attestation details
							<ExternalLinkIcon title="Open attestation details" />
						</a>
						|
						<a href={image.rekor.runInvocationURI}>
							Run invocation
							<ExternalLinkIcon title="Open attestation details" />
						</a>
					</div>
				</div>
			</Card>
		{/if}

		<Card columns={4}>
			<h4>Vulnerabilities summary</h4>
			<div class="circles">
				{#if image.summary.critical === PendingValue}
					<Skeleton variant="circle" width="notificationBadgeSize" height="notificationBadgeSize" />
				{:else}
					<Tooltip placement="right" content="severity: CRITICAL">
						<VulnerabilityBadge
							text={String(image.summary.critical)}
							color={severityToColor('critical')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				{/if}
				{#if image.summary.high === PendingValue}
					<Skeleton variant="circle" width="notificationBadgeSize" height="notificationBadgeSize" />
				{:else}
					<Tooltip placement="right" content="severity: HIGH">
						<VulnerabilityBadge
							text={String(image.summary.high)}
							color={severityToColor('high')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				{/if}
				{#if image.summary.medium === PendingValue}
					<Skeleton variant="circle" width="notificationBadgeSize" height="notificationBadgeSize" />
				{:else}
					<Tooltip placement="right" content="severity: MEDIUM">
						<VulnerabilityBadge
							text={String(image.summary.medium)}
							color={severityToColor('medium')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				{/if}
				{#if image.summary.low === PendingValue}
					<Skeleton variant="circle" width="notificationBadgeSize" height="notificationBadgeSize" />
				{:else}
					<Tooltip placement="right" content="severity: LOW">
						<VulnerabilityBadge
							text={String(image.summary.low)}
							color={severityToColor('low')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				{/if}
				{#if image.summary.unassigned === PendingValue}
					<Skeleton variant="circle" width="notificationBadgeSize" height="notificationBadgeSize" />
				{:else}
					<Tooltip placement="right" content="severity: UNASSIGNED">
						<VulnerabilityBadge
							text={String(image.summary.unassigned)}
							color={severityToColor('unassigned')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				{/if}
			</div>
			Risk score: {image.summary.riskScore !== PendingValue ? image.summary.riskScore : ''} <br />
			Explore findings in
			{#if image.projectId !== PendingValue}
				<a href="https://salsa.nav.cloud.nais.io/projects/{image.projectId}" target="_blank"
					>Dependency track<ExternalLinkIcon
						title="Open project in Dependency track"
						font-size="1.5rem"
					/></a
				>
			{/if}
		</Card>
		<Card columns={12}>
			<h4>Findings</h4>
			{#if image.findings}
				{#if image.findings.nodes.length > 0}
					<Table
						zebraStripes
						size="small"
						sort={sortState}
						on:sortChange={(e) => {
							const { key } = e.detail;
							const ss = sortTable(key, sortState);
							changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
						}}
					>
						<Thead>
							<Th style="width: 12rem" sortable={true} sortKey="NAME">ID</Th>
							<Th style="width: 38rem" sortable={true} sortKey="PACKAGE_URL">Package</Th>
							<Th style="width: 7rem " sortable={true} sortKey="SEVERITY">Severity</Th>
							<Th style="width: 3rem" sortable={true} sortKey="IS_SUPPRESSED">Suppressed</Th>
							<Th sortable={true} sortKey="STATE">State</Th>
						</Thead>
						<Tbody>
							{#each image.findings.nodes as finding}
								{#if finding.id === PendingValue}
									<Tr>
										<Td>
											<Skeleton variant="text" />
										</Td>
										<Td>
											<Skeleton variant="text" />
										</Td>
										<Td>
											<Skeleton variant="text" />
										</Td>
										<Td>
											<Skeleton variant="text" />
										</Td>
										<Td>
											<Skeleton variant="text" />
										</Td>
									</Tr>
								{:else}
									<Tr>
										<Td
											><Button
												variant="tertiary"
												size="small"
												on:click={() => {
													findingToSuppress = finding;
													suppressOpen = true;
												}}
											>
												<code>{finding.vulnId}</code>
											</Button>
										</Td>
										<Td><code>{finding.packageUrl}</code></Td>
										<Td
											><code style="color: {severityToColor(finding.severity.toLocaleLowerCase())}"
												>{finding.severity}</code
											></Td
										>
										<Td style="text-align: center"
											>{#if finding.analysisTrail.isSuppressed}<CheckmarkIcon
													width={'18px'}
													height={'18px'}
												/>{/if}</Td
										>
										<Td>
											<Button
												variant="tertiary-neutral"
												size="small"
												disabled={finding.analysisTrail?.state !== '' ? false : true}
												on:click={() => {
													analysisTrail = finding;
													analysisOpen = true;
												}}
											>
												<code
													>{finding.analysisTrail?.state ? finding.analysisTrail?.state : 'N/A'}
												</code>
											</Button>
										</Td>
									</Tr>
								{/if}
							{/each}
						</Tbody>
					</Table>
				{:else}
					<p>No findings found.</p>
				{/if}
				{#if image.findings.pageInfo}
					<div class="pagination">
						<Pagination
							pageInfo={image.findings.pageInfo}
							{limit}
							{offset}
							changePage={(e) => {
								changeParams({ page: e.toString() });
							}}
						/>
					</div>
				{/if}
			{:else}
				<p>No findings found.</p>
			{/if}
		</Card>
		<Card columns={12}>
			{#if image.id !== PendingValue}
				<Workloads workloads={image.workloadReferences} />
			{/if}
		</Card>
	</div>
{/if}

{#if findingToSuppress && image && image.projectId !== PendingValue}
	<SuppressFinding
		projectId={image?.projectId}
		bind:open={suppressOpen}
		finding={findingToSuppress}
		workloads={image.workloadReferences}
		{user}
		on:close={() => {
			findingToSuppress = undefined;
			console.log('closing now...');
			setTimeout(() => {
				// refetch the image to update the findings
				summary.fetch({
					variables: { env: env, team: team, app: appName },
					policy: 'NetworkOnly'
				});
			}, 2000);
		}}
	/>
{/if}
{#if analysisTrail && image && image.projectId !== PendingValue}
	<TrailFinding
		bind:open={analysisOpen}
		finding={analysisTrail}
		workloads={image.workloadReferences}
		on:close={() => {
			analysisTrail = undefined;
		}}
	/>
{/if}

<style>
	.circles {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 2rem;
	}

	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		gap: 0.5rem;
	}

	code {
		font-size: 1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.imageGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 0.2rem;
		row-gap: 0.2rem;
	}

	.pagination {
		margin-top: 1rem;
	}

	code {
		font-size: 0.8rem;
	}

	.registry {
		grid-column: 1;
		grid-row: 2;
	}

	.repository {
		grid-column: 2;
		grid-row: 2;
	}

	.imageName {
		grid-column: 1;
		grid-row: 1;
	}

	.tag {
		grid-column: 2;
		grid-row: 1;
	}

	.commitSha {
		grid-column-start: 1;
		grid-column-end: 3;
		grid-row: 3;
	}

	.rekor {
		grid-column-start: 1;
		grid-column-end: 3;
		grid-row: 4;
		margin-top: 1rem;
	}
</style>
