<script lang="ts">
	import type { Severity$options } from '$houdini';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import {
		BriefcaseClockIcon,
		CircleFillIcon,
		DatabaseIcon,
		PackageIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		teamSlug: string;
		environmentName: string;
		resourceType: 'app' | 'job' | 'opensearch' | 'postgres' | 'valkey';
		resourceName: string;
		severity: Severity$options;
	}

	let { teamSlug, environmentName, resourceType, resourceName, severity }: Props = $props();
</script>

<IconLabel
	href="/team/{teamSlug}/{environmentName}/{resourceType}/{resourceName}"
	size="medium"
	tag={{
		label: environmentName,
		variant: envTagVariant(environmentName)
	}}
>
	{#snippet icon()}
		<TooltipAlignHack
			content={{
				TODO: 'Todo',
				WARNING: 'Warning',
				CRITICAL: 'Critical'
			}[severity] ?? ''}
		>
			<div class={severity === 'CRITICAL' ? 'critical-icon pulse' : ''}>
				<CircleFillIcon
					style="color: light-dark({{
						TODO: 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)',
						WARNING: 'var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed)',
						CRITICAL: 'var(--ax-bg-danger-strong), var(--ax-bg-danger-strong)'
					}[severity] ?? 'var(--ax-bg-info-strong), var(--ax-bg-info-strong)'}); font-size: 0.7rem"
				/>
			</div>
		</TooltipAlignHack>
	{/snippet}
	{#snippet label()}
		{#if resourceType === 'app'}
			<PackageIcon />
		{:else if resourceType === 'job'}
			<BriefcaseClockIcon />
		{:else if resourceType === 'opensearch'}
			<OpenSearchIcon />
		{:else if resourceType === 'postgres'}
			<DatabaseIcon />
		{:else if resourceType === 'valkey'}
			<ValkeyIcon />
		{/if}
		{resourceName}
	{/snippet}
</IconLabel>

<style>
	.critical-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pulse::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: var(--ax-bg-danger-strong);
		animation: pulse 2s infinite ease-in-out;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse::before {
			animation: none;
			display: none;
		}
	}
</style>
