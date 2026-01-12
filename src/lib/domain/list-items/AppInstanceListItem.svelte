<script lang="ts">
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import Time from '$lib/ui/Time.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { QuestionmarkIcon } from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import ErrorIcon from '../../icons/ErrorIcon.svelte';

	const {
		instance,
		urlBase,
		utilization
	}: {
		instance: {
			name: string;
			restarts: number;
			status: {
				state: string;
				message: string;
			};
			created: Date;
			cpu: { current: number };
			memory: { current: number };
		};
		urlBase: string;
		utilization: {
			requested_cpu: number;
			requested_memory: number;
		};
	} = $props();
</script>

<ListItem>
	<IconLabel size="large" href="{urlBase}{instance.name}" label={instance.name} as="h4">
		{#snippet description()}
			Created <Time time={instance.created} distance={true} />, {instance.status
				.message}{#if instance.restarts > 0}, {instance.restarts} restart{instance.restarts === 1
					? ''
					: 's'}
			{/if}
		{/snippet}
		{#snippet icon()}
			{#if instance.status.state === 'RUNNING'}
				<TooltipAlignHack content="Instance is running">
					<RunningIndicator />
				</TooltipAlignHack>
			{:else if instance.status.state === 'FAILING'}
				<TooltipAlignHack content="Instance is failing">
					<ErrorIcon />
				</TooltipAlignHack>
			{:else}
				<TooltipAlignHack content="Application instance status is unknown">
					<QuestionmarkIcon />
				</TooltipAlignHack>
			{/if}
		{/snippet}
	</IconLabel>
	<div>
		<div>
			<TooltipAlignHack
				content={`Memory usage compared to the requested ${prettyBytes(
					utilization.requested_memory,
					{
						locale: 'en',
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
						binary: true
					}
				)}.`}
			>
				<IconLabel
					size="small"
					icon={MemoryIcon}
					label={`${prettyBytes(instance.memory.current, {
						locale: 'en',
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
						binary: true
					})} (${((instance.memory.current / utilization.requested_memory) * 100).toLocaleString(
						'en',
						{ maximumSignificantDigits: 3 }
					)}%)`}
				/>
			</TooltipAlignHack>
		</div>
		<div>
			<TooltipAlignHack
				content={`CPU usage compared to the requested ${utilization.requested_cpu} CPUs.`}
			>
				<IconLabel
					size="small"
					icon={CpuIcon}
					label={`${instance.cpu.current.toLocaleString('en', {
						maximumSignificantDigits: 3
					})} CPUs (${((instance.cpu.current / utilization.requested_cpu) * 100).toLocaleString(
						'en',
						{ maximumSignificantDigits: 3 }
					)}%)`}
				/>
			</TooltipAlignHack>
		</div>
	</div>
</ListItem>
