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
	level="4"
	href="/team/{teamSlug}/{environmentName}/{resourceType}/{resourceName}"
	size="large"
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
			<CircleFillIcon
				style="color: var({{
					TODO: '--ax-bg-info-strong',
					WARNING: '--ax-bg-warning-moderate-pressed',
					CRITICAL: '--ax-bg-danger-strong'
				}[severity] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
			/>
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
