<script lang="ts">
	import { getIssueResource, type IssueDisplayData } from '$lib/domain/issues/issueResource';
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
		item: IssueDisplayData;
	}

	let { item }: Props = $props();

	const resource = $derived.by(() => getIssueResource(item));

	const ResourceIcon = $derived.by(() => {
		switch (resource.kind) {
			case 'opensearch':
				return OpenSearchIcon;
			case 'database':
				return DatabaseIcon;
			case 'valkey':
				return ValkeyIcon;
			case 'unleash':
				return UnleashIcon;
			case 'job':
				return BriefcaseClockIcon;
			default:
				return PackageIcon;
		}
	});

	const issueTitle = $derived.by(() => {
		const typeName = item.__typename || 'Unknown';
		const enumLike = typeName
			.replace(/Issue$/, '')
			.replace('OpenSearch', 'Opensearch')
			.replace('SqlInstance', 'Sqlinstance')
			.replace(/([a-z])([A-Z])/g, '$1_$2')
			.toUpperCase();
		return issueTypeLabel(enumLike);
	});
</script>

<details class="item">
	<summary class="head">
		<div class="chev">
			<ChevronRightIcon />
		</div>
		<div class="severity-dot">
			{#if item.severity === 'CRITICAL'}
				<CriticalIndicator />
			{:else}
				<CircleFillIcon
					style="color: light-dark({{
						TODO: 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)',
						WARNING: 'var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed)'
					}[item.severity] ??
						'var(--ax-bg-info-strong), var(--ax-bg-info-strong)'}); font-size: 0.7rem"
				/>
			{/if}
		</div>
		<div class="resource-icon">
			<ResourceIcon />
		</div>
		<div class="resource-group">
			<span class="resource-name" title={resource.name}>{resource.name}</span>
			<Tag size="xsmall" variant={envTagVariant(item.teamEnvironment.environment.name)}
				>{item.teamEnvironment.environment.name}</Tag
			>
		</div>
		<span class="issue-title">{issueTitle}</span>
	</summary>

	<div class="detail">
		<p class="message">{item.message}</p>
		{#if item.__typename === 'DeprecatedIngressIssue' && item.application && item.ingresses}
			<div class="extra">
				<strong>
					{item.ingresses.length === 1 ? 'Deprecated ingress:' : 'Deprecated ingresses:'}
				</strong>
				{#each item.ingresses as ingress (ingress)}
					<span class="ingress">{ingress}</span>
				{/each}
			</div>
		{/if}
		{#if item.__typename === 'ExternalIngressCriticalVulnerabilityIssue' && item.cvssScore !== undefined}
			<div class="extra">
				<strong>CVSS Score:</strong>
				{item.cvssScore}
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
