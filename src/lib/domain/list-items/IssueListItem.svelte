<script lang="ts">
	import { fragment, graphql, type IssueFragment } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import CriticalIndicator from '$lib/ui/CriticalIndicator.svelte';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';
	import { Tag } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		ChevronRightIcon,
		CircleFillIcon,
		DatabaseIcon,
		PackageIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		item: IssueFragment;
	}

	let { item }: Props = $props();

	// Houdini 2.0 bug: shared fields must be repeated in each inline fragment
	let data = $derived(
		fragment(
			item,
			graphql(`
				fragment IssueFragment on Issue {
					__typename
					teamEnvironment {
						environment {
							name
						}
						team {
							slug
						}
					}
					message
					severity
					... on DeprecatedIngressIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						application {
							name
						}
						ingresses
					}
					... on DeprecatedRegistryIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
							image {
								name
							}
						}
					}
					... on ExternalIngressCriticalVulnerabilityIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						cvssScore
						ingresses
						workload {
							__typename
							name
						}
					}
					... on LastRunFailedIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						job {
							name
						}
					}
					... on FailedSynchronizationIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on InvalidSpecIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on MissingSbomIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on NoRunningInstancesIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on ApplicationRestartLoopIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on OpenSearchIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						event
						openSearch {
							name
						}
					}
					... on SqlInstanceStateIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						sqlInstance {
							name
						}
						state
					}
					... on SqlInstanceVersionIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						sqlInstance {
							name
						}
					}
					... on ValkeyIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						valkey {
							name
						}
					}
					... on VulnerableImageIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on WorkloadProblemIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						workload {
							__typename
							name
						}
					}
					... on UnleashReleaseChannelIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						unleash {
							name
						}
					}
				}
			`)
		)
	);

	const resourceName = $derived.by(() => {
		const d = $data;
		if (!d) return '';
		if (d.ApplicationRestartLoopIssue?.workload) return d.ApplicationRestartLoopIssue.workload.name;
		if (d.DeprecatedIngressIssue?.application) return d.DeprecatedIngressIssue.application.name;
		if (d.DeprecatedRegistryIssue?.workload) return d.DeprecatedRegistryIssue.workload.name;
		if (d.ExternalIngressCriticalVulnerabilityIssue?.workload)
			return d.ExternalIngressCriticalVulnerabilityIssue.workload.name;
		if (d.FailedSynchronizationIssue?.workload) return d.FailedSynchronizationIssue.workload.name;
		if (d.InvalidSpecIssue?.workload) return d.InvalidSpecIssue.workload.name;
		if (d.MissingSbomIssue?.workload) return d.MissingSbomIssue.workload.name;
		if (d.NoRunningInstancesIssue?.workload) return d.NoRunningInstancesIssue.workload.name;
		if (d.VulnerableImageIssue?.workload) return d.VulnerableImageIssue.workload.name;
		if (d.WorkloadProblemIssue?.workload) return d.WorkloadProblemIssue.workload.name;
		if (d.LastRunFailedIssue?.job) return d.LastRunFailedIssue.job.name;
		if (d.OpenSearchIssue?.openSearch) return d.OpenSearchIssue.openSearch.name;
		if (d.SqlInstanceStateIssue?.sqlInstance) return d.SqlInstanceStateIssue.sqlInstance.name;
		if (d.SqlInstanceVersionIssue?.sqlInstance) return d.SqlInstanceVersionIssue.sqlInstance.name;
		if (d.UnleashReleaseChannelIssue?.unleash) return d.UnleashReleaseChannelIssue.unleash.name;
		if (d.ValkeyIssue?.valkey) return d.ValkeyIssue.valkey.name;
		return 'Unknown';
	});

	const ResourceIcon = $derived.by(() => {
		const d = $data;
		if (!d) return PackageIcon;
		if (d.ApplicationRestartLoopIssue) return PackageIcon;
		if (d.DeprecatedIngressIssue) return PackageIcon;
		if (d.DeprecatedRegistryIssue) {
			if (d.DeprecatedRegistryIssue.workload?.__typename === 'Job') return BriefcaseClockIcon;
			return PackageIcon;
		}
		if (d.ExternalIngressCriticalVulnerabilityIssue) return PackageIcon;
		if (d.FailedSynchronizationIssue) {
			if (d.FailedSynchronizationIssue.workload?.__typename === 'Job') return BriefcaseClockIcon;
			return PackageIcon;
		}
		if (d.InvalidSpecIssue) {
			if (d.InvalidSpecIssue.workload?.__typename === 'Job') return BriefcaseClockIcon;
			return PackageIcon;
		}
		if (d.LastRunFailedIssue) return BriefcaseClockIcon;
		if (d.MissingSbomIssue) {
			if (d.MissingSbomIssue.workload?.__typename === 'Job') return BriefcaseClockIcon;
			return PackageIcon;
		}
		if (d.NoRunningInstancesIssue) return PackageIcon;
		if (d.OpenSearchIssue) return OpenSearchIcon;
		if (d.SqlInstanceStateIssue) return DatabaseIcon;
		if (d.SqlInstanceVersionIssue) return DatabaseIcon;
		if (d.UnleashReleaseChannelIssue) return UnleashIcon;
		if (d.ValkeyIssue) return ValkeyIcon;
		if (d.VulnerableImageIssue) return PackageIcon;
		if (d.WorkloadProblemIssue) {
			if (d.WorkloadProblemIssue.workload?.__typename === 'Job') return BriefcaseClockIcon;
			return PackageIcon;
		}
		return PackageIcon;
	});

	const issueTitle = $derived.by(() => {
		if (!$data) return '';
		const typeName = $data.__typename
			.replace(/Issue$/, '')
			.replace(/([a-z])([A-Z])/g, '$1_$2')
			.toUpperCase();
		return issueTypeLabel(typeName);
	});
</script>

<details class="item">
	<summary class="head">
		<div class="chev">
			<ChevronRightIcon />
		</div>
		<div class="severity-dot">
			{#if $data?.severity === 'CRITICAL'}
				<CriticalIndicator />
			{:else}
				<CircleFillIcon
					style="color: light-dark({{{
						TODO: 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)',
						WARNING: 'var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed)'
					}[$data?.severity] ??
						'var(--ax-bg-info-strong), var(--ax-bg-info-strong)'}}); font-size: 0.7rem"
				/>
			{/if}
		</div>
		<div class="resource-icon">
			<ResourceIcon />
		</div>
		<div class="resource-group">
			<span class="resource-name" title={resourceName}>{resourceName}</span>
			<Tag size="xsmall" variant={envTagVariant($data?.teamEnvironment?.environment?.name ?? '')}
				>{$data?.teamEnvironment?.environment?.name ?? ''}</Tag
			>
		</div>
		<span class="issue-title">{issueTitle}</span>
	</summary>

	<div class="detail">
		<p class="message">{$data?.message}</p>
		{#if $data?.DeprecatedIngressIssue && 'ingresses' in $data.DeprecatedIngressIssue}
			<div class="extra">
				<strong>
					{$data.DeprecatedIngressIssue.ingresses.length === 1
						? 'Deprecated ingress:'
						: 'Deprecated ingresses:'}
				</strong>
				{#each $data.DeprecatedIngressIssue.ingresses as ingress (ingress)}
					<span class="ingress">{ingress}</span>
				{/each}
			</div>
		{/if}
		{#if $data?.__typename === 'ExternalIngressCriticalVulnerabilityIssue' && 'cvssScore' in $data}
			<div class="extra">
				<strong>CVSS Score:</strong>
				{$data.cvssScore}
			</div>
		{/if}
	</div>
</details>

<style>
	details > summary {
		list-style: none;
	}
	details > summary::-webkit-details-marker {
		display: none;
	}

	.item {
		background: var(--ax-bg-default);
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
	}

	.head {
		display: grid;
		grid-template-columns: 22px 16px 18px minmax(0, auto) minmax(100px, 1fr);
		align-items: center;
		gap: var(--ax-space-8);
		padding: 10px 14px;
		cursor: pointer;
		transition: background-color 120ms ease;
	}

	.item:not([open]) > summary.head:hover {
		background: color-mix(in srgb, var(--surface-accent-color) 6%, var(--ax-bg-default));
	}

	.item[open] > summary.head {
		background: color-mix(in srgb, var(--surface-accent-color) 10%, var(--ax-bg-default));
	}

	.chev {
		width: 16px;
		height: 16px;
		color: var(--ax-text-neutral);
		transition: transform 0.18s ease;
	}
	.item[open] .chev {
		transform: rotate(90deg);
	}

	.severity-dot {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.resource-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-6);
		min-width: 0;
		flex-wrap: wrap;
	}

	.resource-name {
		color: var(--ax-text-neutral);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.resource-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}

	.issue-title {
		color: var(--ax-text-neutral);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		text-align: right;
	}

	.resource-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ax-text-neutral-subtle);
		font-size: 1rem;
	}

	.detail {
		padding: 12px 14px 14px calc(14px + 22px + var(--ax-space-8));
		background: var(--ax-bg-default);
		border-top: 1px dashed var(--ax-border-neutral-subtle);
	}

	.message {
		margin: 0;
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-small);
		line-height: var(--ax-font-line-height-large);
	}

	.extra {
		margin-top: var(--ax-space-8);
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	.ingress {
		word-break: break-word;
		color: var(--ax-text-neutral-subtle);
	}

	@media (max-width: 767px), (max-height: 500px) {
		.head {
			grid-template-columns: 22px 16px 18px 1fr;
			gap: var(--ax-space-6);
		}

		.issue-title {
			grid-column: 1 / -1;
			padding-left: calc(22px + 16px + 18px + var(--ax-space-6) * 3);
			text-align: left;
		}
	}
</style>
