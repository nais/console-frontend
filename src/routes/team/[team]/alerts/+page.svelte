<script lang="ts">
	import { AlertOrderField } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import { formatSeconds } from '$lib/components/vulnerability/dateUtils';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyLong, CopyButton, ExpansionCard, Heading, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon, ClockDashedIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Alerts } = $derived(data);
</script>

<BodyLong spacing>
	{#if $Alerts.data?.team.alerts.pageInfo.totalCount == 0}
		<strong>No alerts found.</strong> Alerts notify you when something needs your attention.
		<ExternalLink href={docURL('/observability/alerting')}
			>Learn more about alerts and how to get started.</ExternalLink
		>
	{:else}
		Alerts notify you when something needs your attention.
		<ExternalLink href={docURL('/observability/alerting')}
			>Learn more about alerts and how to get started.</ExternalLink
		>
	{/if}
</BodyLong>
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
					<span class="description">
						Rule group: <strong>{alert.ruleGroup}</strong>
					</span>
				{/snippet}

				{#if alert.__typename === 'PrometheusAlert'}
					<Heading level="2" size="xsmall" spacing style="margin-top: var(--ax-space-8)"
						>Current alarms ({alert.alarms.length})</Heading
					>
					<div class="alarms">
						{#each alert.alarms as alarm, i (alarm)}
							<div class="alarm">
								<div class="alarm-heading">
									<div class="heading-with-tag">
										<Tag variant={alarm.state === 'FIRING' ? 'error' : 'warning'} size="small"
											>{alarm.state}</Tag
										>
										<Heading level="3" size="small">
											{alarm.summary !== '' ? alarm.summary : 'Alarm ' + (i + 1)}
										</Heading>
									</div>
									<div class="right">
										<span class="since"
											>{alarm.state === 'FIRING' ? 'Firing ' : 'Pending '} since <Time
												time={alarm.since}
												distance
											/></span
										>
									</div>
								</div>
								<div class="alarm-label">
									<dl class="kv">
										<dt>Action</dt>
										<dd>{alarm.action || 'No action label defined in PrometheusRule'}</dd>

										<dt>Consequence</dt>
										<dd>{alarm.consequence || 'No consequence defined in PrometheusRule'}</dd>
									</dl>
								</div>
							</div>
						{:else}
							No alerts firing
						{/each}
					</div>
					<div class="query-heading">
						<Heading level="2" size="xsmall">Query</Heading><CopyButton
							text="Copy query"
							activeText="Query copied"
							variant="action"
							copyText={alert.query}
							size="xsmall"
						/>
					</div>

					<div class="query-wrap">
						<pre class="query"><code>{alert.query}</code></pre>
					</div>
					<div style="color: var(--ax-text-info-decoration);">
						<IconLabel
							icon={ClockDashedIcon}
							label={`for: ${formatSeconds(alert.duration)}`}
							size="small"
						/>
					</div>
				{/if}
			</ExpansionCard>
		{/each}
	</div>
{/if}

<style>
	.cards {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}
	.order-by {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--ax-space-4);
	}
	.description {
		margin-top: var(--ax-space-8);
	}
	.alarm-heading {
		display: flex;
		justify-content: space-between;
	}
	.heading-with-tag {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}
	.alarm-label {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--ax-space-4);
		padding: var(--ax-space-4) 0;
	}

	.since {
		color: var(--ax-text-neutral);
		font-size: 0.9rem;
		text-align: right;
	}
	.query {
		font-family: monospace;
		font-size: 0.8rem;
		white-space: pre-wrap;
	}
	.query-heading {
		margin-top: var(--ax-space-8);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.kv {
		display: grid;
		grid-template-columns: minmax(8rem, 18rem) 1fr;
		gap: var(--ax-space-2) var(--ax-space-6);
		align-items: start;
		margin-top: var(--ax-space-3);
	}

	.kv dt {
		color: var(--ax-text-neutral);
	}
	.kv dd {
		margin: 0;
	}

	.alarms {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}
	.alarm {
		border-bottom: 1px solid var(--ax-border-neutral-subtle);
	}
</style>
