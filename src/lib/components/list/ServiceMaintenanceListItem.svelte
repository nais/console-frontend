<script lang="ts">
	import ServiceMaintenanceStatus from '$lib/ServiceMaintenanceStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import ListItem from '$lib/components/list/ListItem.svelte';
	interface Props {
		title: string;
		description: string;
		start_at: string;
		start_after: string;
		deadline: boolean;
	}

	let { title, description, start_at, deadline }: Props = $props();
</script>

<ListItem>
	<div>
		<Heading level="4" size="small">{title}</Heading>
		<p>{description}</p>
		{#if !!start_at}
			<p>Maintenance is scheduled for: <Time time={start_at} dateFormat="PPPPp" /></p>
		{/if}
	</div>
	<div class="status">
		<ServiceMaintenanceStatus status={deadline ? 'DEADLINE' : 'NO_DEADLINE'} />
	</div>
</ListItem>

<style>
	.status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4, --a-spacing-1);
		font-size: 16px;
	}

	.heading {
		font-size: 20px;
		font-weight: 650;
	}
</style>
