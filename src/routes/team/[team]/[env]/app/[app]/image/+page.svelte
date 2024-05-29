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
		Link,
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
		<Card columns={7}>
			<h4 class="imageHeader">
				Image details
				{#if image.id !== PendingValue}
					<CopyButton
						size="xsmall"
						variant="action"
						text="Copy image name"
						activeText="Image name copied"
						copyText={image.name}
					/>
				{/if}
			</h4>

			<dl>
				<dt>Registry</dt>
				<dd>
					{#if image.id !== PendingValue}
						<code>{registry}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</dd>
				<dt>Repository</dt>
				<dd>
					{#if image.id !== PendingValue}
						<code>{repository}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</dd>

				<dt>Name</dt>
				<dd>
					{#if image.id !== PendingValue}
						<code>{name}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</dd>
				<dt>Tag</dt>
				<dd>
					{#if image.id !== PendingValue}
						<code>{tag}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</dd>
				<dt>Digest</dt>
				<dd>
					{#if image.id !== PendingValue}
						<code>{image.digest}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</dd>
			</dl>
		</Card>

		<Card columns={5}>
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
			<p>Risk score: {image.summary.riskScore !== PendingValue ? image.summary.riskScore : ''}</p>
			<p>
				Explore in
				{#if image.projectId !== PendingValue}
					<Link href="https://salsa.nav.cloud.nais.io/projects/{image.projectId}" target="_blank"
						>Dependency track<ExternalLinkIcon
							title="Open project in Dependency track"
							font-size="1.5rem"
						/></Link
					>
				{/if}
			</p>
			<p>
				Attestation URL:
				{#if image.rekorId !== PendingValue}
					<Link href="https://search.sigstore.dev/?logIndex={image.rekorId}" target="_blank"
						>Rekor<ExternalLinkIcon title="Open attestation in Sigstore" font-size="1.5rem" /></Link
					>
				{/if}
			</p>
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
							<Th sortable={true} sortKey="PACKAGE_URL">Package</Th>
							<Th style="width: 7rem " sortable={true} sortKey="SEVERITY">Severity</Th>
							<Th>Description</Th>
							<Th>Suppressed</Th>
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
										<Td>{finding.description}</Td>
										<Td
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
{#if analysisTrail}
	<TrailFinding
		bind:open={analysisOpen}
		finding={analysisTrail}
		on:close={() => {
			analysisTrail = undefined;
		}}
	/>
{/if}

<style>
	.circles {
		display: flex;
		gap: 1rem;
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

	dt {
		font-size: 1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.pagination {
		margin-top: 1rem;
	}

	code {
		font-size: 0.8rem;
	}
</style>
