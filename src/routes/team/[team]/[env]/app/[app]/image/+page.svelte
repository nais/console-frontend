<script lang="ts">
	import { logEvent } from '$lib/amplitude';
	import Card from '$lib/Card.svelte';
	import { docURL } from '$lib/doc';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	import { parseImage } from '$lib/utils/image';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { Alert, CopyButton, Tooltip } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	//import Workloads from '$lib/components/image/Workloads.svelte';

	export let data: PageData;

	$: ({ Image, UserInfo } = data);

	$: image = $Image.data?.team.environment.application.image;
	$: user = UserInfo.data?.me.__typename == 'User' ? UserInfo.data?.me.name : '';
	//$: auth = $Image.data?.team.viewerIsMember;

	$: console.log(user);

	/*const summary = graphql(`
		query Summary($env: String!, $team: Slug!, $app: String!) {
			app(env: $env, team: $team, name: $app) {
				imageDetails {
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
	`);*/

	const notificationBadgeSize = '48px';

	//let appName = $page.params.app;
	//let env = $page.params.env;
	//let team = $page.params.team;
	//
	let registry: string;
	let repository: string;
	let name: string;
	//let findingToSuppress: FindingType | undefined;
	//let suppressOpen = false;
	//let analysisTrail: FindingType | undefined;
	//let analysisOpen = false;

	$: {
		if (image) {
			({ registry, repository, name } = parseImage(image.name));
		}
	}

	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/app/findings'
		};
		logEvent('pageview', props);
	};
</script>

{#if $Image.errors}
	<Alert variant="error">
		<p>{$Image.errors[0].message}</p>
	</Alert>
{/if}
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
					<code>{image.tag ? image.tag : ''}</code>
				</div>
				<!--{#if image.projectId !== ''}
					<div class="digest">
						<h5>Digest</h5>
						<code>{image.rekor.imageDigestSHA ? image.rekor.imageDigestSHA : ''}</code>
					</div>
					<div class="rekor">
						<a href="https://search.sigstore.dev/?logIndex={image.rekor.logIndex}">
							Attestation details
							<ExternalLinkIcon title="Open attestation details" />
						</a>
						|
						<a href={image.rekor.runInvocationURI}>
							Build reference
							<ExternalLinkIcon title="Open build reference" />
						</a>
						|
						<a href="https://{registry}/{repository}/{name}">
							Image registry
							<ExternalLinkIcon title="Open images in registry" />
						</a>
					</div>
				{/if}-->
			</div>
		</Card>

		<Card columns={4}>
			<h4>Vulnerabilities</h4>
			{#if image.vulnerabilitySummary}
				<div class="circles">
					<Tooltip placement="right" content="severity: CRITICAL">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.critical)}
							color={severityToColor('critical')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: HIGH">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.high)}
							color={severityToColor('high')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: MEDIUM">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.medium)}
							color={severityToColor('medium')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: LOW">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.low)}
							color={severityToColor('low')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: UNASSIGNED">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.unassigned)}
							color={severityToColor('unassigned')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				</div>
				Risk score: {image.vulnerabilitySummary.riskScore} <br />
				<!--{#if image.projectUrl !== ''}
					Explore findings in
					<a href={image.projectUrl} target="_blank"
						>Dependency track
						<ExternalLinkIcon title="Open project in Dependency track" font-size="1.5rem" />
					</a>
				{/if}-->
			{:else if !image.hasSBOM}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				Data was discovered, but the SBOM was not rendered. Please refer to the
				<a href={docURL('/security/salsa/#slsa-in-nais')}>NAIS documentation</a>
				for further assistance.
			{:else}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				No data found.
				<a href={docURL('/services/salsa/#slsa-in-nais')} on:click={onClick}> How to fix</a>
			{/if}
		</Card>
		<!--{#if image.findings && image.projectId !== ''}
			<Card columns={12}>
				<h4>Findings</h4>
				{#if image.findings.nodes.length > 0}
					<Table zebraStripes size="small">
						<Thead>
							<Th style="width: 12rem" sortable={true} sortKey="NAME">ID</Th>
							<Th style="width: 38rem" sortable={true} sortKey="PACKAGE_URL">Package</Th>
							<Th style="width: 7rem " sortable={true} sortKey="SEVERITY">Severity</Th>
							<Th style="width: 3rem" sortable={true} sortKey="IS_SUPPRESSED">Suppressed</Th>
							<Th sortable={true} sortKey="STATE">State</Th>
						</Thead>
						<Tbody>
							{#each image.findings.nodes as finding}
								<Tr>
									<Td>
										{#if auth}
											<Button
												variant="tertiary"
												size="xsmall"
												on:click={() => {
													findingToSuppress = finding;
													suppressOpen = true;
												}}
											>
												<code>{finding.vulnId}</code>
											</Button>
										{:else}
											<code>{finding.vulnId}</code>
										{/if}
									</Td>
									<Td><code>{finding.packageUrl}</code></Td>
									<Td
										><code style="color: {severityToColor(finding.severity.toLocaleLowerCase())}"
											>{finding.severity}</code
										></Td
									>
									<Td style="text-align: center">
										{#if finding.analysisTrail.isSuppressed}
											<CheckmarkIcon width={'18px'} height={'18px'} />
										{/if}
									</Td>
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
							{/each}
						</Tbody>
					</Table>
				{:else}
					<p>No findings found.</p>
				{/if}
			</Card>
		{/if}-->
		<!--Card columns={12}>
			<Workloads workloads={image.workloadReferences} />
		</Card-->
	</div>
{/if}

<!--
{#if findingToSuppress && image && image.projectId !== PendingValue && auth !== undefined && auth !== PendingValue}
	{#key findingToSuppress.id}
		<SuppressFinding
			projectId={image?.projectId}
			bind:open={suppressOpen}
			finding={findingToSuppress}
			workloads={image.workloadReferences}
			{user}
			{auth}
			on:close={() => {
				findingToSuppress = undefined;
				setTimeout(() => {
					// refetch the image to update the findings
					summary.fetch({
						variables: { env: env, team: team, app: appName },
						policy: 'NetworkOnly'
					});
				}, 2000);
			}}
		/>
	{/key}
{/if}-->
<!--
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
-->

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

	.digest {
		grid-column-start: 1;
		grid-column-end: 3;
	}

	.rekor {
		grid-column-start: 1;
		grid-column-end: 3;
		grid-row: 4;
		margin-top: 1rem;
	}
</style>
