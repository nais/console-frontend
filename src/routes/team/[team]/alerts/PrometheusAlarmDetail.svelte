<script lang="ts">
	import type { AlertState } from '$houdini';
	import Time from '#lib/ui/Time.svelte';
	import { Heading, Tag } from '@nais/ds-svelte-community';
	import type { ValueOf } from 'houdini/runtime';

	const {
		alarm,
		i
	}: {
		alarm: {
			summary: string;
			state: ValueOf<typeof AlertState>;
			since: Date;
			action: string;
			consequence: string;
			value: number;
		};
		i: number;
	} = $props();

	const uid = $props.id();
</script>

<section class="alarm" aria-labelledby={`${uid}-heading`}>
	<div class="alarm-head">
		<div class="heading-with-tag">
			<Tag variant={alarm.state === 'FIRING' ? 'error' : 'warning'} size="small">
				{alarm.state}
			</Tag>
			<Heading as="h3" size="xsmall" id={`${uid}-heading`}>Alarm {i + 1}</Heading>
		</div>
		<span class="since">
			Active since
			<Time time={alarm.since} distance />
		</span>
	</div>

	{#if alarm.summary}
		<p class="summary">{alarm.summary}</p>
	{/if}
	<dl class="annotations">
		<dt>Consequence</dt>
		<dd>{alarm.consequence || 'No consequence defined in PrometheusRule'}</dd>

		<dt>Action</dt>
		<dd>{alarm.action || 'No action label defined in PrometheusRule'}</dd>
	</dl>
	<dl class="metric">
		<dt>Value</dt>
		<dd>{alarm.value}</dd>
	</dl>
</section>

<style>
	.alarm {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		border-left: var(--ax-space-4) solid var(--ax-border-neutral-subtleA);
		padding-left: var(--ax-space-16);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.alarm-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}
	.heading-with-tag {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}

	.summary {
		margin: 0;
	}
	.annotations {
		display: grid;
		gap: var(--ax-space-4);
		margin: 0;
	}
	.annotations dt {
		font-weight: var(--ax-font-weight-bold);
	}
	.annotations dt:not(:first-child) {
		margin-top: var(--ax-space-12);
	}
	.annotations dd {
		margin: 0;
		white-space: pre-wrap;
	}
	.metric {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		margin: 0;
		font-size: var(--ax-font-size-small);
	}
	.metric dd {
		margin: 0;
	}
	.since {
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-small);
	}
</style>
