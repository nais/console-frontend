<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import TooltipAlignHack from '../TooltipAlignHack.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'OpenSearchIssue' }>;
	} = $props();
</script>

<div class="item">
	<div>
		<IconLabel
			level="4"
			href="/team/{data.teamEnvironment.team.slug}/{data.teamEnvironment.environment
				.name}/opensearch/{data.openSearch.name}"
			size="large"
			label={data.openSearch.name}
			tag={{
				label: data.teamEnvironment.environment.name,
				variant: envTagVariant(data.teamEnvironment.environment.name)
			}}
		>
			{#snippet icon()}
				<TooltipAlignHack
					content={{
						TODO: 'Todo',
						WARNING: 'Warning',
						CRITICAL: 'Critical'
					}[data.severity] ?? ''}
				>
					<CircleFillIcon
						style="color: var({{
							TODO: '--ax-bg-success-strong',
							WARNING: '--ax-bg-warning-moderate-pressed',
							CRITICAL: '--ax-bg-danger-strong'
						}[data.severity] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
					/>
				</TooltipAlignHack>
			{/snippet}
		</IconLabel>
	</div>

	<div>
		<BodyShort>{data.message}</BodyShort>
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 300px auto;
		gap: 1rem;
	}
</style>
