<script lang="ts">
	import type { Severity$options } from '$houdini';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		teamSlug: string;
		environmentName: string;
		workloadType: 'app' | 'job';
		workloadName: string;
		severity: Severity$options;
	}

	let { teamSlug, environmentName, workloadType, workloadName, severity }: Props = $props();
</script>

<IconLabel
	level="4"
	href="/team/{teamSlug}/{environmentName}/{workloadType}/{workloadName}"
	size="large"
	label={workloadName}
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
					TODO: '--ax-bg-success-strong',
					WARNING: '--ax-bg-warning-moderate-pressed',
					CRITICAL: '--ax-bg-danger-strong'
				}[severity] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
			/>
		</TooltipAlignHack>
	{/snippet}
</IconLabel>
