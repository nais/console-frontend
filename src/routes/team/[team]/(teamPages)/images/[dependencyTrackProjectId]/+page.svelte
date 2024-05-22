<script lang="ts">
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
		CopyButton,
		Link,
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

	export let data: PageData;

	$: ({ Image } = data);

	$: image = $Image.data?.dependencyTrackProject;

	const notificationBadgeSize = '48px';

	let registry: string;
	let repository: string;
	let name: string;
	let tag: string;

	$: {
		if (image) {
			({ registry, repository, name, tag } = parseImage(image?.name));
		}
	}

	$: ({ sortState, limit, offset } = tableStateFromVariables($Image.variables));
</script>

{#if image}
	<div class="grid">
		<Card columns={8}>
			<h4 class="imageHeader">
				Image details
				<CopyButton
					size="xsmall"
					variant="action"
					text="Copy image name"
					activeText="Image name copied"
					copyText={image?.name}
				/>
			</h4>
			<p class="lastActivity">
				<a href={'https://github.com'}>Deployed</a>
				<Time time={new Date()} distance={true} />
				by
				<a href="https://github.com/deployer">deployer</a>.
			</p>
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
				<div class="digest">
					<h5>Digest</h5>
					<code>{image?.digest}</code>
				</div>

				<div class="workloads">
					<h5>Workloads</h5>
					{#if image?.workloadReferences}
						<dl style="margin-top: 0">
							{#each image?.workloadReferences as workload}
								<dt>
									<a href={`/team/${workload.team}/${workload.environment}/app/${workload.name}`}
										>{workload.team}:{workload.environment}:{workload.name}</a
									>
								</dt>
								<dd>
									{#if workload.deployInfo.url === ''}
										deployed
									{:else}
										<a href={workload.deployInfo.url}>deployed</a>
									{/if}
									{#if workload.deployInfo.timestamp}
										<Time time={workload.deployInfo.timestamp} distance={true} />
									{/if}
									{#if workload.deployInfo.deployer !== ''}
										by
										<a href="https://github.com/{workload.deployInfo.deployer}"
											>{workload.deployInfo.deployer}</a
										>.
									{/if}
								</dd>
							{/each}
						</dl>
					{:else}
						No workloads
					{/if}
				</div>
			</div>
		</Card>
		<Card columns={4}>
			<h4>Vulnerabilities summary</h4>
			<div class="circles">
				<Tooltip placement="right" content="severity: CRITICAL">
					<VulnerabilityBadge
						text={String(image?.summary.critical)}
						color={severityToColor('critical')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: HIGH">
					<VulnerabilityBadge
						text={String(image?.summary.high)}
						color={severityToColor('high')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: MEDIUM">
					<VulnerabilityBadge
						text={String(image?.summary.medium)}
						color={severityToColor('medium')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: LOW">
					<VulnerabilityBadge
						text={String(image?.summary.low)}
						color={severityToColor('low')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: UNASSIGNED">
					<VulnerabilityBadge
						text={String(image?.summary.unassigned)}
						color={severityToColor('unassigned')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
			</div>
			<p>Risk score: {image?.summary.riskScore}</p>
			<p>
				View in <Link
					href="https://salsa.nav.cloud.nais.io/projects/{image?.projectId}"
					target="_blank"
					>Dependency track<ExternalLinkIcon
						title="Upgrading major version"
						font-size="1.5rem"
					/></Link
				>
			</p>
			<p>
				Attestation URL:
				<Link href="https://search.sigstore.dev/?logIndex={image?.rekorId}" target="_blank"
					>Rekor<ExternalLinkIcon title="Upgrading major version" font-size="1.5rem" /></Link
				>
			</p>
		</Card>
		<Card columns={12}>
			<h4>Findings</h4>
			{#if image?.findings}
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
						<Th sortable={true} sortKey="PACKAGE_URL">Package</Th>
						<Th sortable={true} sortKey="SEVERITY">Severity</Th>
						<Th style="width: 8rem;">CVE</Th>
						<Th style="width: 11rem;">GHSA</Th>
						<Th>OSV</Th>
						<Th style="width: 20rem;">Description</Th>
					</Thead>
					<Tbody>
						{#each image.findings.nodes as finding}
							<Tr>
								<Td>{finding.packageUrl}</Td>
								<Td>{finding.severity}</Td>
								<Td><code>{finding.cveId}</code></Td>
								<Td><code>{finding.ghsaId}</code></Td>
								<Td><code>{finding.osvId}</code></Td>
								<Td>{finding.description}</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
				<div class="pagination">
					<Pagination
						pageInfo={image?.findings.pageInfo}
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
{/if}

<style>
	.circles {
		display: flex;
		gap: 1rem;
	}
	.lastActivity {
		margin-top: 0px;
	}

	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		gap: 0.5rem;
	}

	.imageGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 0rem;
		row-gap: 0rem;
	}

	.registry {
		grid-column: 1;
		grid-row: 1;
	}

	.repository {
		grid-column: 2;
		grid-row: 1;
	}

	.imageName {
		grid-column: 1;
		grid-row: 2;
	}

	.tag {
		grid-column: 2;
		grid-row: 2;
	}

	.digest {
		grid-column-start: 1;
		grid-column-end: span 2;
		grid-row: 3;
	}
	.workloads {
		grid-column-start: 1;
		grid-column-end: span 2;
		grid-row: 4;
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
	.pagination {
		margin-top: 1rem;
	}

	code {
		font-size: 0.8rem;
	}
</style>
