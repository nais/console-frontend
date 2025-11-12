<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { BriefcaseClockIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';

	interface Props {
		workload: {
			name: string;
			__typename: string | null;
			teamEnvironment: {
				environment: { name: string };
			};
			team: { slug: string };
		};
		hideTeam?: boolean;
		hideEnv?: boolean;
		warning?: string;
	}
	let { workload, hideTeam, hideEnv, warning }: Props = $props();
</script>

<IconLabel
	label={workload.name}
	description={hideTeam ? undefined : workload.team.slug}
	tag={hideEnv
		? undefined
		: {
				label: workload.teamEnvironment.environment.name,
				variant: envTagVariant(workload.teamEnvironment.environment.name)
			}}
	href="/team/{workload.team.slug}/{workload.teamEnvironment.environment
		.name}/{workload.__typename === 'Job' ? 'job' : 'app'}/{workload.name}"
>
	{#snippet icon()}
		{#if warning}
			<TooltipAlignHack content={warning}>
				<WarningIcon />
			</TooltipAlignHack>
		{:else if workload.__typename === 'Job'}
			<BriefcaseClockIcon />
		{:else}
			<PackageIcon />
		{/if}
	{/snippet}
</IconLabel>
