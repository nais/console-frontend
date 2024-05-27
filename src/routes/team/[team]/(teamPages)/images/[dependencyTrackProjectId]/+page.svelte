<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
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
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import SuppressFinding, { type FindingType } from './SuppressFinding.svelte';
	import TrailFinding, { type AnalysisTrailType } from './TrailFinding.svelte';

	export let data: PageData;

	$: ({ Image, UserInfo } = data);

	$: image = $Image.data?.dependencyTrackProject;
	$: user = UserInfo.data?.me.__typename == 'User' ? UserInfo.data?.me.name : '';

	const notificationBadgeSize = '48px';

	let registry: string;
	let repository: string;
	let name: string;
	let tag: string;
	let findingToSuppress: FindingType | undefined;
	let analysisTrail: AnalysisTrailType | undefined;

	$: {
		if (image && image.id !== PendingValue) {
			({ registry, repository, name, tag } = parseImage(image.name));
		}
	}

	$: ({ sortState, limit, offset } = tableStateFromVariables($Image.variables));
</script>

<div class="grid">
	{#if image}
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

			<div class="workloads">
				{#if image.workloadReferences}
					<h5>Workloads</h5>
					<Table size="small" zebraStripes>
						<Thead>
							<Th>Team</Th>
							<Th>Environment</Th>
							<Th>Workload</Th>
							<Th>Deploy ref</Th>
							<Th>Age</Th>
						</Thead>
						<Tbody>
							{#each image.workloadReferences as workload}
								{#if workload.id !== PendingValue}
									<Tr>
										<Td>
											<a href={`/team/${workload.team}`}>{workload.team}</a>
										</Td>
										<Td>
											{workload.environment}
										</Td>
										<Td>
											{#if workload.workloadType === 'app'}
												<a
													href={`/team/${workload.team}/${workload.environment}/app/${workload.name}`}
													>{workload.name}</a
												>
											{:else if workload.workloadType === 'job'}
												<a
													href={`/team/${workload.team}/${workload.environment}/job/${workload.name}`}
													>{workload.name}</a
												>
											{/if}
										</Td>
										<Td>
											{#if workload.deployInfo.url}
												<a href={workload.deployInfo.url} target="_blank">Run</a>
											{/if}
										</Td>
										<Td>
											{#if workload.deployInfo.timestamp !== null}
												<Time time={workload.deployInfo.timestamp} distance={true} />
											{/if}
										</Td>
									</Tr>
								{:else}
									<Tr>
										{#each Array(5).fill('text') as variant}
											<Td>
												<Skeleton {variant} />
											</Td>
										{/each}
									</Tr>
								{/if}
							{/each}
						</Tbody>
					</Table>
				{:else}
					No workloads
				{/if}
			</div>
		</Card>
	{/if}

	<Card columns={5}>
		<h4>Vulnerabilities summary</h4>
		<div class="circles">
			{#if image}
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
			{/if}
		</div>
		{#if image}
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
		{/if}
	</Card>
	<Card columns={12}>
		<h4>Findings</h4>
		{#if image && image.findings}
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
									<!--Td>
										<Skeleton variant="text" />
									</Td-->
									<Td>
										<Skeleton variant="text" />
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td
										><Button
											variant="secondary"
											size="small"
											on:click={() => (findingToSuppress = finding)}
										>
											<code>{finding.vulnId}</code>
										</Button>
									</Td>
									<Td><code>{finding.packageUrl}</code></Td>
									<Td
										><span style="color: {severityToColor(finding.severity.toLocaleLowerCase())}"
											>{finding.severity}</span
										></Td
									>
									<!--Td><code>{joinAliases(finding.aliases, finding.vulnId)}</code></Td-->
									<Td>{finding.description}</Td>
									<Td>
										<Button
											variant="secondary"
											size="small"
											disabled={true}
											on:click={() => (findingToSuppress = finding)}
										>
											<code>{finding.isSuppressed ? finding.state : 'N/A'} </code>
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
		{:else}
			<p>No findings found.</p>
		{/if}
	</Card>
</div>
{#if findingToSuppress}
	<SuppressFinding
		open={true}
		finding={findingToSuppress}
		{user}
		on:close={() => {
			findingToSuppress = undefined;
		}}
	/>
{/if}

{#if findingToSuppress && findingToSuppress.isSuppressed}
	<TrailFinding
		open={true}
		finding={findingToSuppress}
		{analysisTrail}
		on:close={() => {
			findingToSuppress = undefined;
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

	.workloads {
		grid-column-start: 1;
		grid-column-end: span 2;
		grid-row: 4;
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
