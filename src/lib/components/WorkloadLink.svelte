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
	<IconWithText {size} description="{workload.team.slug} / {workload.environment.name}">
		{#snippet icon()}
			{#if showIcon}
				{#if workload.__typename === 'Job'}
					<BriefcaseClockIcon />
				{:else}
					<PackageIcon />
				{/if}
			{/if}
		{/snippet}
		{#snippet text()}
			<span class="workload-name">{workload.name}</span>
		{/snippet}
	</IconWithText>
</a>

<style>
	a {
		font-weight: var(--a-font-weight-bold);
		&:not(:active) {
			color: var(--a-text-defualt);
		}
		text-decoration: none;
		&:hover .workload-name {
			text-decoration: underline;
		}
	}
</style>
