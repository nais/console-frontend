<script lang="ts">
	import type { JobRuns } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Detail, Loader, Tooltip } from '@nais/ds-svelte-community';
	import {
		CheckmarkCircleFillIcon,
		QuestionmarkIcon,
		TimerIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		job: JobRuns;
	}

	let { job }: Props = $props();

	let data = $derived(
		fragment(
			job,
			graphql(`
				fragment JobRuns on Job {
					team {
						slug
					}
					name
					environment {
						name
					}
					runs(first: 20) @list(name: "All_Runs") {
						edges {
							node {
								name
								startTime
								completionTime
								duration
								status {
									message
									state
								}
								trigger {
									type
									actor
								}
							}
						}
					}
				}
			`)
		)
	);

	const formatDuration = (duration: number) => {
		const minute = 60;
		const hour = 60 * minute;

		const hours = Math.floor(duration / hour);
		const minutes = Math.floor((duration % hour) / minute);
		const seconds = Math.floor(duration % minute);

		if (hours > 0) {
			return `${hours}h ${minutes}m ${seconds}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		} else {
			return `${seconds}s`;
		}
	};
</script>

{#if $data.runs.edges.length === 0}
	<div>No runs found</div>
{:else}
	<div class="runs-list">
		<div class="runs-header">
			<div class="runs-count">
				<BodyShort size="small" style="font-weight: bold;">
					{$data.runs.edges.length + ' job run' + ($data.runs.edges.length > 1 ? 's' : '')}
				</BodyShort>
			</div>
		</div>
		{#each $data.runs.edges as run}
			<div class="runs-list-item">
				<div class="run-link-wrapper">
					<div style="height: 23.98px; display: flex; align-items: center; line-height: 0">
						{#if run.node.status.state === 'RUNNING'}
							<Tooltip content="Job is running">
								<Loader size="xsmall" variant="interaction" />
							</Tooltip>
						{:else if run.node.status.state === 'PENDING'}
							<Tooltip content="Job run pending">
								<Loader size="xsmall" variant="interaction" />
							</Tooltip>
						{:else if run.node.status.state === 'SUCCEEDED'}
							<Tooltip content="Job ran successfully">
								<CheckmarkCircleFillIcon style="color: var(--a-icon-success)" />
							</Tooltip>
						{:else if run.node.status.state === 'FAILED'}
							<Tooltip content="Job run failed">
								<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
							</Tooltip>
						{:else}
							<Tooltip content="Job run status is unknown">
								<QuestionmarkIcon />
							</Tooltip>
						{/if}
					</div>
					<div class="run-link">
						<a
							href="/team/{$data.team.slug}/{$data.environment.name}/job/{$data.name}/logs?name={run
								.node.name}"
						>
							{run.node.name}
						</a>
						<Detail>
							{#if run.node.trigger.type === 'MANUAL'}
								Manually triggered
							{:else}
								Automatically triggered
							{/if}
							{#if run.node.startTime}
								<Time time={run.node.startTime} distance={true} />
							{/if}
							{#if run.node.trigger.actor}
								by {run.node.trigger.actor}.
							{:else}
								by cron schedule.
							{/if}
						</Detail>
					</div>
				</div>
				<div class="run-info">
					<div class="run-detail">
						<TimerIcon /><Detail>{formatDuration(run.node.duration)}</Detail>
					</div>
					<Detail>{run.node.status.message}</Detail>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.runs-list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;

		.runs-header {
			background-color: var(--active-color);
			border-radius: 4px 4px 0 0;
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.runs-count {
			font-weight: bold;
		}
		.runs-list-item {
			.run-link-wrapper {
				display: flex;
				gap: 0.3rem;
			}
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
			&:not(:last-of-type) {
				border-bottom: 1px solid var(--a-border-default);
			}

			&:hover {
				background-color: var(--a-surface-subtle);
			}

			.run-link {
				:global(a) {
					font-weight: var(--a-font-weight-bold);
					&:not(:active) {
						color: var(--a-text-defualt);
					}
					text-decoration: none;
					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
		.run-info {
			display: flex;
			align-items: flex-end;
			gap: 4px;
			flex-direction: column;
		}

		.run-detail {
			display: flex;
			align-items: center;
			gap: 4px;
		}
	}
</style>
