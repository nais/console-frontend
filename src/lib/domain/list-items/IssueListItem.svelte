<script lang="ts">
	import { fragment, graphql, type IssueFragment } from '$houdini';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import OpenSearchIcon from '#lib/icons/OpenSearchIcon.svelte';
	import UnleashIcon from '#lib/icons/UnleashIcon.svelte';
	import ValkeyIcon from '#lib/icons/ValkeyIcon.svelte';
	import CriticalIndicator from '#lib/ui/CriticalIndicator.svelte';
	import { issueTypeLabel } from '#lib/utils/issueTypeLabel.js';
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

	// TODO(houdini): TS types claim type-keyed properties ($data.VulnerableImageIssue etc.) but runtime data is flat. Recheck after upgrading past 2.0.9.
	const resourceName = $derived.by(() => {
		const d = $data as Record<string, unknown>;
		if (!d) return '';
		if ('workload' in d && d.workload) {
			return (d.workload as { name: string }).name;
		}
		if ('application' in d && d.application) {
			return (d.application as { name: string }).name;
		}
		if ('job' in d && d.job) {
			return (d.job as { name: string }).name;
		}
		if ('openSearch' in d && d.openSearch) {
			return (d.openSearch as { name: string }).name;
		}
		if ('sqlInstance' in d && d.sqlInstance) {
			return (d.sqlInstance as { name: string }).name;
		}
		if ('unleash' in d && d.unleash) {
			return (d.unleash as { name: string }).name;
		}
		if ('valkey' in d && d.valkey) {
			return (d.valkey as { name: string }).name;
		}
		return 'Unknown';
	});

	// TODO(houdini): same flat-data workaround as resourceName above.
	const resourceHref = $derived.by(() => {
		const d = $data as Record<string, unknown>;
		if (!d) return '';
		const env = $data?.teamEnvironment?.environment?.name;
		const team = $data?.teamEnvironment?.team?.slug;
		if (!env || !team) return '';

		if ('workload' in d && d.workload) {
			const w = d.workload as { __typename: string; name: string };
			const type = w.__typename === 'Application' ? 'app' : 'job';
			return `/team/${team}/${env}/${type}/${w.name}`;
		}
		if ('application' in d && d.application) {
			return `/team/${team}/${env}/app/${(d.application as { name: string }).name}`;
		}
		if ('job' in d && d.job) {
			return `/team/${team}/${env}/job/${(d.job as { name: string }).name}`;
		}
		if ('openSearch' in d && d.openSearch) {
			return `/team/${team}/${env}/opensearch/${(d.openSearch as { name: string }).name}`;
		}
		if ('sqlInstance' in d && d.sqlInstance) {
			return `/team/${team}/${env}/cloudsql/${(d.sqlInstance as { name: string }).name}`;
		}
		if ('unleash' in d && d.unleash) {
			return `/team/${team}/unleash`;
		}
		if ('valkey' in d && d.valkey) {
			return `/team/${team}/${env}/valkey/${(d.valkey as { name: string }).name}`;
		}
		return '';
	});

	// TODO(houdini): same flat-data workaround as resourceName above.
	const ResourceIcon = $derived.by(() => {
		const d = $data as Record<string, unknown>;
		if (!d) return PackageIcon;
		const typename = $data?.__typename;
		if (typename === 'LastRunFailedIssue') return BriefcaseClockIcon;
		if (typename === 'OpenSearchIssue') return OpenSearchIcon;
		if (typename === 'SqlInstanceStateIssue' || typename === 'SqlInstanceVersionIssue')
			return DatabaseIcon;
		if (typename === 'UnleashReleaseChannelIssue') return UnleashIcon;
		if (typename === 'ValkeyIssue') return ValkeyIcon;
		if ('workload' in d && d.workload) {
			if ((d.workload as { __typename: string }).__typename === 'Job') return BriefcaseClockIcon;
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
					style="color: light-dark({{
						TODO: 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)',
						WARNING: 'var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed)'
					}[$data?.severity] ??
						'var(--ax-bg-info-strong), var(--ax-bg-info-strong)'}); font-size: 0.7rem"
				/>
			{/if}
		</div>
		<div class="resource-icon">
			<ResourceIcon />
		</div>
		<div class="resource-group">
			{#if resourceHref}
				<a
					class="resource-name"
					href={resourceHref}
					title={resourceName}
					onclick={(e) => e.stopPropagation()}>{resourceName}</a
				>
			{:else}
				<span class="resource-name" title={resourceName}>{resourceName}</span>
			{/if}
			{#if $data?.teamEnvironment?.environment?.name}
				<Tag size="xsmall" variant={envTagVariant($data.teamEnvironment.environment.name)}
					>{$data.teamEnvironment.environment.name}</Tag
				>
			{/if}
		</div>
		<span class="issue-title">{issueTitle}</span>
	</summary>

	<div class="detail">
		<p class="message">{$data?.message}</p>
		{#if $data?.__typename === 'DeprecatedIngressIssue' && 'ingresses' in ($data as Record<string, unknown>)}
			{@const ingresses = ($data as unknown as { ingresses: string[] }).ingresses}
			<div class="extra">
				<strong>
					{ingresses.length === 1 ? 'Deprecated ingress:' : 'Deprecated ingresses:'}
				</strong>
				{#each ingresses as ingress (ingress)}
					<span class="ingress">{ingress}</span>
				{/each}
			</div>
		{/if}
		{#if $data?.__typename === 'ExternalIngressCriticalVulnerabilityIssue' && 'cvssScore' in ($data as Record<string, unknown>)}
			<div class="extra">
				<strong>CVSS Score:</strong>
				{($data as unknown as { cvssScore: number }).cvssScore}
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

	a.resource-name {
		text-decoration: none;
	}

	a.resource-name:hover,
	a.resource-name:focus-visible {
		text-decoration: underline;
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
