<script lang="ts">
	import { AlertOrderField } from '$houdini';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import { formatSeconds } from '$lib/components/vulnerability/dateUtils';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { Detail, ExpansionCard, Heading } from '@nais/ds-svelte-community';
	import { CircleFillIcon, ClockDashedIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Alerts } = $derived(data);
</script>

{#if $Alerts.data && $Alerts.data?.team.alerts.pageInfo.totalCount > 0}
	{@const alerts = $Alerts.data.team.alerts}
	<div class="order-by">
		<OrderByMenu orderField={AlertOrderField} defaultOrderField={AlertOrderField.STATE} />
	</div>

	<div class="cards">
		{#each alerts.nodes as alert (alert.id)}
			<ExpansionCard
				size="small"
				showMoreTitle="Show more"
				style="background-color: var(--ax-neutral-100);"
			>
				{#snippet header()}
					<IconLabel
						level="4"
						size="large"
						label={alert.name}
						tag={{
							label: alert.teamEnvironment.environment.name,
							variant: envTagVariant(alert.teamEnvironment.environment.name)
						}}
					>
						{#snippet icon()}
							<CircleFillIcon
								style="color: var(--ax-text-{{
									INACTIVE: 'success',
									FIRING: 'danger',
									PENDING: 'warning'
								}[alert.state] ?? 'info'}-decoration); font-size: 0.7rem"
							/>
						{/snippet}
					</IconLabel>
				{/snippet}
				{#snippet description()}
					<div class="description">
						Very descriptive alert description that might even span multiple lines.
					</div>
				{/snippet}
				<Heading level="2" size="xsmall">Query</Heading>
				<Detail>
					<div class="query">{alert.query}</div>
					<IconLabel
						icon={ClockDashedIcon}
						label={`for: ${formatSeconds(alert.duration)}`}
						size="small"
					/>
				</Detail>
				{#if alert.__typename === 'PrometheusAlert'}
					<Heading level="2" size="xsmall" style="margin-top: var(--ax-space-8)"
						>Current alarms ({alert.alarms.length})</Heading
					>
					{#each alert.alarms as alarm (alarm)}
						<div class="alarm">
							<div>
								<IconLabel
									size="small"
									label={alarm.summary}
									tag={{
										label: alarm.state,
										variant: alarm.state === 'FIRING' ? 'error' : 'warning'
									}}
								>
									{#snippet icon()}
										<TooltipAlignHack
											content={{
												INACTIVE: 'Alert inactive',
												FIRING: 'Alert firing',
												PENDING: 'Alert is pending'
											}[alarm.state] ?? ''}
											placement="right"
										>
											<CircleFillIcon
												style="color: var(--ax-text-{{
													INACTIVE: 'success',
													FIRING: 'danger',
													PENDING: 'warning'
												}[alarm.state] ?? 'info'}-decoration); font-size: 0.7rem"
											/>
										</TooltipAlignHack>
									{/snippet}
								</IconLabel>
							</div>

							<div>
								{#if alarm.action}
									<Heading level="3" size="xsmall">Action</Heading>
									{alarm.action}
								{/if}
								{#if alarm.summary}
									<Heading level="3" size="xsmall">Summary</Heading>
									{alarm.summary}
								{/if}
								{#if alarm.consequence}
									<Heading level="3" size="xsmall">Consequence</Heading>
									{alarm.consequence}
								{/if}
								<div class="right">
									<span class="since"
										>{alarm.state === 'FIRING' ? 'Firing ' : 'Pending '} since <Time
											time={alarm.since}
											distance
										/></span
									>
								</div>
							</div>
						</div>
					{:else}
						No alerts firing
					{/each}
				{/if}
			</ExpansionCard>
		{/each}
	</div>
{/if}

<style>
	.cards {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
	.order-by {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--ax-space-4);
	}
	.description {
		font-size: 0.9rem;
		margin-top: var(--ax-space-4);
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}
	.alarm {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--spacing-layout);
	}
	.since {
		color: var(--ax-text-neutral-decoration);
		font-size: 0.9rem;
		text-align: right;
	}
	.query {
		font-family: monospace;
		font-size: 0.8rem;
		white-space: pre-wrap;
	}
</style>
