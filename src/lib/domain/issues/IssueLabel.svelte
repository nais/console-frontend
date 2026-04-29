<script lang="ts">
	import type { Severity$options } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import CriticalIndicator from '$lib/ui/CriticalIndicator.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import {
		BriefcaseClockIcon,
		CircleFillIcon,
		DatabaseIcon,
		PackageIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		teamSlug: string;
		environmentName: string;
		resourceType: 'app' | 'job' | 'opensearch' | 'cloudsql' | 'postgres' | 'valkey';
		resourceName: string;
		severity: Severity$options;
	}

	let { teamSlug, environmentName, resourceType, resourceName, severity }: Props = $props();

	const resourceIcon = $derived.by(() => {
		switch (resourceType) {
			case 'app':
				return PackageIcon;
			case 'job':
				return BriefcaseClockIcon;
			case 'opensearch':
				return OpenSearchIcon;
			case 'cloudsql':
				return DatabaseIcon;
			case 'postgres':
				return DatabaseIcon;
			case 'valkey':
				return ValkeyIcon;
		}
	});
</script>

<div class="issue-label">
	<TooltipAlignHack
		content={{
			TODO: 'Todo',
			WARNING: 'Warning',
			CRITICAL: 'Critical'
		}[severity] ?? ''}
	>
		{#if severity === 'CRITICAL'}
			<CriticalIndicator />
		{:else}
			<CircleFillIcon
				style="color: light-dark({{
					TODO: 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)',
					WARNING: 'var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed)'
				}[severity] ?? 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)'}); font-size: 0.7rem"
			/>
		{/if}
	</TooltipAlignHack>
	<IconLabel
		href="/team/{teamSlug}/{environmentName}/{resourceType}/{resourceName}"
		size="small"
		icon={resourceIcon}
		label={resourceName}
		tag={{
			label: environmentName,
			variant: envTagVariant(environmentName)
		}}
	/>
</div>

<style>
	.issue-label {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
		max-width: 100%;
	}

	.issue-label :global(.icon-label) {
		min-width: 0;
		max-width: 100%;
	}

	.issue-label :global(.icon-label .content),
	.issue-label :global(.icon-label .desc) {
		min-width: 0;
	}

	.issue-label :global(.icon-label .desc) {
		flex-wrap: wrap;
	}

	.issue-label :global(.aksel-detail),
	.issue-label :global(.aksel-body-short),
	.issue-label :global(.aksel-heading) {
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	@media (prefers-reduced-motion: reduce) {
	}
</style>
