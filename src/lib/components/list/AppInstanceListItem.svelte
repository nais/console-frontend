<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Detail } from '@nais/ds-svelte-community';
	import { QuestionmarkIcon } from '@nais/ds-svelte-community/icons';
	import ErrorIcon from '../../icons/ErrorIcon.svelte';
	import IconLabel from '../IconLabel.svelte';
	import RunningIndicator from '../RunningIndicator.svelte';
	import TooltipAlignHack from '../TooltipAlignHack.svelte';
	import ListItem from './ListItem.svelte';

	const {
		instance,
		urlBase
	}: {
		instance: {
			name: string;
			restarts: number;
			status: {
				state: string;
				message: string;
			};
			created: Date;
		};
		urlBase: string;
	} = $props();
</script>

<ListItem>
	<IconLabel size="large" href="{urlBase}{instance.name}" label={instance.name} level="4">
		{#snippet description()}
			Created <Time time={instance.created} distance={true} />
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
	<div class="right">
		<Detail>{instance.restarts + ' restart' + (instance.restarts === 1 ? '' : 's')}</Detail>
		<Detail>{instance.status.state}: {instance.status.message}</Detail>
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--a-spacing-05);
	}
</style>
