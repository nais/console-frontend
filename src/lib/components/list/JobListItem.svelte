<script lang="ts">
	import type { JobRunState$options } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { Detail, Loader, Tooltip } from '@nais/ds-svelte-community';
	import { CircleFillIcon, QuestionmarkIcon, RocketIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import ErrorIcon from '../../icons/ErrorIcon.svelte';
	import IconLabel from '../IconLabel.svelte';
	import TooltipAlignHack from '../TooltipAlignHack.svelte';
	import ListItem from './ListItem.svelte';

	const {
		job
	}: {
		job: {
			__typename: string | null;
			name: string;
			teamEnvironment: { environment: { name: string } };
			team: { slug: string };
			status: { state: string };
			deployments: { nodes: { createdAt: Date }[] };
			runs: {
				pageInfo: { totalCount: number };
				edges: {
					node: { startTime: Date | null; status: { message: string; state: JobRunState$options } };
				}[];
			};
		};
	} = $props();
</script>

<ListItem>
	<IconLabel
		level="4"
		label={job.name}
		href="/team/{job.team.slug}/{job.teamEnvironment.environment.name}/job/{job.name}"
		size="large"
		tag={{
			label: job.teamEnvironment.environment.name,
			variant: envTagVariant(job.teamEnvironment.environment.name)
		}}
	>
		{#snippet icon()}
			<TooltipAlignHack
				content={{
					NAIS: 'Job is healthy',
					FAILING: 'Job is failing',
					NOT_NAIS: 'Job has issues',
					UNKNOWN: 'Job status is unknown'
				}[job.status.state] ?? ''}
			>
				<CircleFillIcon
					style="color: var(--ax-text-{{
						NAIS: 'success',
						FAILING: 'danger',
						NOT_NAIS: 'warning',
						UNKNOWN: 'info'
					}[job.status.state] ?? 'info'}-icon, --a-icon-{{
						NAIS: 'success',
						FAILING: 'danger',
						NOT_NAIS: 'warning',
						UNKNOWN: 'info'
					}[job.status.state] ?? 'info'}); font-size: 0.7rem"
				/>
			</TooltipAlignHack>
		{/snippet}
	</IconLabel>
	<div class="right">
		{#if job.deployments.nodes.length > 0}
			{@const timestamp = job.deployments.nodes[0].createdAt}
			<Tooltip
				content="Last deploy - {format(timestamp, 'PPPP', {
					locale: enGB
				})}"
			>
				<IconLabel size="small" icon={RocketIcon}>
					{#snippet label()}
						<Time time={timestamp} distance={true} />
					{/snippet}
				</IconLabel>
			</Tooltip>
		{/if}
		<Detail>
			{#if job.runs.edges.length}
				{@const lastRun = job.runs.edges[0].node}
				<div style="display: flex; gap: 4px; align-items: center;">
					{#if lastRun.status}
						{#if lastRun.status.state === 'RUNNING'}
							<TooltipAlignHack content="Job is running">
								<Loader size="xsmall" variant="interaction" />
							</TooltipAlignHack>
						{:else if lastRun.status.state === 'PENDING'}
							<TooltipAlignHack content="Job run pending">
								<Loader size="xsmall" variant="interaction" />
							</TooltipAlignHack>
						{:else if lastRun.status.state === 'SUCCEEDED'}
							<TooltipAlignHack content="Last job ran successfully">
								<SuccessIcon />
							</TooltipAlignHack>
						{:else if lastRun.status.state === 'FAILED'}
							<TooltipAlignHack content="Last job run failed">
								<ErrorIcon />
							</TooltipAlignHack>
						{:else}
							<TooltipAlignHack content="Job run status is unknown">
								<QuestionmarkIcon />
							</TooltipAlignHack>
						{/if}
					{:else}
						<TooltipAlignHack content="Job run status is unknown">
							<QuestionmarkIcon />
						</TooltipAlignHack>
					{/if}
					{#if lastRun.startTime}
						<TooltipAlignHack
							content="Last run - {format(lastRun.startTime, 'PPPP', { locale: enGB })}"
						>
							<Detail><Time time={lastRun.startTime} distance={true} /></Detail>
						</TooltipAlignHack>
					{/if}
				</div>
			{:else}
				<Detail>No runs</Detail>
			{/if}
		</Detail>
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2, --a-spacing-05);
	}
</style>
