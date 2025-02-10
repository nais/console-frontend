<script lang="ts">
	import { Tooltip } from '@nais/ds-svelte-community';
	import {
		BriefcaseClockIcon,
		ExclamationmarkTriangleFillIcon,
		PackageIcon
	} from '@nais/ds-svelte-community/icons';
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
		hideTeam?: boolean;
		hideEnv?: boolean;
		warningMessage?: string;
	}
	let { workload, showIcon, size = 'medium', hideTeam, hideEnv, warningMessage }: Props = $props();

	const description = [
		hideTeam ? undefined : workload.team.slug,
		hideEnv ? undefined : workload.environment.name
	]
		.filter(Boolean)
		.join(' / ');
</script>

{#if warningMessage}
	<Tooltip content={warningMessage}>
		<a
			href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
				? 'job'
				: 'app'}/{workload.name}"
		>
			<IconWithText {size} {description}>
				{#snippet icon()}
					{#if showIcon}
						<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" />
					{/if}
				{/snippet}
				{#snippet text()}
					<span class="workload-name">{workload.name}</span>
				{/snippet}
			</IconWithText>
		</a>
	</Tooltip>
{:else}
	<a
		href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
			? 'job'
			: 'app'}/{workload.name}"
	>
		<IconWithText {size} {description}>
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
{/if}

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
