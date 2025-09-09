<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import TooltipAlignHack from '../TooltipAlignHack.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'ValkeyIssue' }>;
	} = $props();
</script>

<div class="item">
	<div>
		<IconLabel
			level="4"
			href="/team/{data.teamEnvironment.team.slug}/{data.teamEnvironment.environment
				.name}/valkey/{data.valkey.name}"
			size="large"
			label={data.valkey.name}
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
						style="color: var(--ax-text-{{
							TODO: 'info',
							WARNING: 'warning',
							CRITICAL: 'danger'
						}[data.severity] ?? 'info'}-decoration); font-size: 0.7rem"
					/>
				</TooltipAlignHack>
			{/snippet}
		</IconLabel>
	</div>

	<div>
		<Heading level="4" size="xsmall" spacing>Valkey issue</Heading>
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
