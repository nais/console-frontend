<script lang="ts">
	import type { AlertState, ValueOf } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { Heading, Tag } from '@nais/ds-svelte-community';

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
</script>

<div class="alarm">
	<div class="alarm-head">
		<div class="heading-with-tag">
			<Tag variant={alarm.state === 'FIRING' ? 'error' : 'warning'} size="small">
				{alarm.state}
			</Tag>
			<Heading level="3" size="xsmall">
				{alarm.summary !== '' ? alarm.summary : `Alarm ${i + 1}`}
			</Heading>
		</div>
		<div class="right">
			<span class="since">
				Active since
				<Time time={alarm.since} distance />
			</span>
		</div>
	</div>

	<dl class="kv">
		<dt>Action</dt>
		<dd>{alarm.action || 'No action label defined in PrometheusRule'}</dd>

		<dt>Consequence</dt>
		<dd>{alarm.consequence || 'No consequence defined in PrometheusRule'}</dd>

		<dt>Value</dt>
		<dd>{alarm.value}</dd>
	</dl>
</div>

<style>
	.alarm {
		margin-bottom: var(--ax-space-16);
		border-bottom: 1px solid var(--ax-border-neutral-subtle);
	}
	.alarm:last-child {
		border-bottom: 0;
	}
	.alarm-head {
		display: flex;
		justify-content: space-between;
	}
	.heading-with-tag {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-8);
	}

	.kv {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-2) var(--ax-space-6);
		align-items: start;
		margin-top: var(--ax-space-3);
		font-size: 0.9rem;
	}
	.kv dt {
		font-weight: 600;
	}
	.since {
		color: var(--ax-text-neutral);
		font-size: 0.9rem;
		text-align: right;
	}
</style>
