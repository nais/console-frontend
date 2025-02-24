<script lang="ts">
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { BriefcaseClockIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from './IconLabel.svelte';
	import TooltipAlignHack from './TooltipAlignHack.svelte';

	interface Props {
		workload: {
			name: string;
			__typename: string | null;
			environment: { name: string };
			team: { slug: string };
		};
		hideTeam?: boolean;
		hideEnv?: boolean;
		warning?: string;
	}
	let { workload, hideTeam, hideEnv, warning }: Props = $props();

	const description = [
		hideTeam ? undefined : workload.team.slug,
		hideEnv ? undefined : workload.environment.name
	]
		.filter(Boolean)
		.join(' / ');
</script>

<IconLabel
	label={workload.name}
	{description}
	href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
		? 'job'
		: 'app'}/{workload.name}"
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
