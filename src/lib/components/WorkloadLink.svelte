<script lang="ts">
	import { BriefcaseClockIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import IconWithText from './IconWithText.svelte';

	interface Props {
		workload: {
			readonly name: string;
			readonly __typename: string | null;
			readonly environment: {
				readonly name: string;
			};
			readonly team: {
				readonly slug: string;
			};
		};
		showIcon?: boolean;
		//iconSize?: string;
		size?: 'small' | 'medium' | 'large';
	}
	let { workload, showIcon, size = 'medium' }: Props = $props();
</script>

<a
	href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
		? 'job'
		: 'app'}/{workload.name}"
>
	<IconWithText text={workload.name} {size}>
		{#snippet icon()}
			{#if showIcon}
				{#if workload.__typename === 'Job'}
					<BriefcaseClockIcon />
				{:else}
					<PackageIcon />
				{/if}
			{/if}
		{/snippet}
	</IconWithText>
</a>
