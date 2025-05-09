<script lang="ts">
	import { fragment, graphql, type DeploymentItemFragment } from '$houdini';
	import ServiceMaintenanceStatus from '$lib/ServiceMaintenanceStatus.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import ListItem from '$lib/components/list/ListItem.svelte';
	interface Props {
		title: String;
		description: String;
		start_at: String;
		start_after: String;
		has_deadline: boolean;
	}

	let { title, description, start_at, start_after, has_deadline }: Props = $props();
</script>

<ListItem>
	<BodyShort size="small" spacing>
		<h4>{title}</h4>
		<p>{description}</p>
		<time time={start_at} />
	</BodyShort>
	<div class="status">
		<ServiceMaintenanceStatus status={!!has_deadline ? 'DEADLINE' : 'NO_DEADLINE'} />
	</div>
</ListItem>

<style>
	code {
		font-size: 14px;
	}
	.status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4, --a-spacing-1);
		font-size: 16px;
	}
</style>
