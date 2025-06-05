<script lang="ts">
	import { fragment, graphql, type Ingresses } from '$houdini';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import { GlobeIcon, HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		app: Ingresses;
	}

	let { app }: Props = $props();

	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment Ingresses on Application {
					ingresses {
						url
						type
					}
					status {
						errors {
							... on WorkloadStatusDeprecatedIngress {
								__typename
								ingress
							}
						}
					}
				}
			`)
		)
	);
</script>

<Heading level="2" size="medium" spacing>Ingresses</Heading>

<div class="content">
	{#each Object.entries(Object.groupBy($data.ingresses, ({ type }) => type)) as [group, ingresses] (group)}
		{#each ingresses as ingress (ingress)}
			<IconLabel size="medium" label={ingress.url} href={ingress.url}>
				{#snippet icon()}
					{#each $data.status.errors as error (error)}
						{#if error.__typename === 'WorkloadStatusDeprecatedIngress' && error.ingress === ingress.url}
							<TooltipAlignHack content="Deprecated ingress: {error.ingress}"
								><WarningIcon /></TooltipAlignHack
							>
						{/if}
					{/each}
					<TooltipAlignHack
						content={group === 'UNKNOWN'
							? 'Ingress not found'
							: `${group[0]}${group.slice(1).toLowerCase()} ingress`}
					>
						{#if group === 'EXTERNAL'}
							<GlobeIcon />
						{:else if group === 'INTERNAL'}
							<HouseIcon />
						{:else if group === 'AUTHENTICATED'}
							<PadlockLockedIcon />
						{:else}
							<WarningIcon />
						{/if}
					</TooltipAlignHack>
				{/snippet}
			</IconLabel>
		{/each}
	{:else}
		<BodyShort>No ingresses configured for this app.</BodyShort>
	{/each}
</div>

<style>
	.content {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--ax-space-4);
	}
</style>
