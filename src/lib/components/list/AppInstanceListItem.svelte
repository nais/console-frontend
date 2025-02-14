<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Detail, Heading, Link, Tooltip } from '@nais/ds-svelte-community';
	import { QuestionmarkIcon, XMarkOctagonFillIcon } from '@nais/ds-svelte-community/icons';
	import IconWithText from '../IconWithText.svelte';
	import RunningIndicator from '../RunningIndicator.svelte';
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
	<IconWithText size="large">
		{#snippet description()}
			Created <Time time={instance.created} distance={true} />
		{/snippet}
		{#snippet icon()}
			<div class="tooltip-icon-hack">
				{#if instance.status.state === 'RUNNING'}
					<Tooltip content="Instance is running">
						<RunningIndicator />
					</Tooltip>
				{:else if instance.status.state === 'FAILING'}
					<Tooltip content="Instance is failing">
						<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
					</Tooltip>
				{:else}
					<Tooltip content="Application instance status is unknown">
						<QuestionmarkIcon />
					</Tooltip>
				{/if}
			</div>
		{/snippet}
		{#snippet text()}
			<Heading level="4" size="xsmall">
				<Link href="{urlBase}{instance.name}">{instance.name}</Link>
			</Heading>
		{/snippet}
	</IconWithText>
	<div class="right">
		<Detail>{instance.restarts + ' restart' + (instance.restarts === 1 ? '' : 's')}</Detail>
		<Detail>{instance.status.state}: {instance.status.message}</Detail>
	</div>
</ListItem>

<style>
	.tooltip-icon-hack {
		display: contents;
		line-height: 0;
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--a-spacing-05);
	}
</style>
