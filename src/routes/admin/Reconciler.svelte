<script lang="ts">
	import { fragment, graphql, type ReconcilerFragment } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Accordion,
		AccordionItem,
		Button,
		Heading,
		Switch,
		TextField
	} from '@nais/ds-svelte-community';

	export let reconciler: ReconcilerFragment;
	let confirm = false;

	$: r = fragment(
		reconciler,
		graphql(`
			fragment ReconcilerFragment on Reconciler {
				configured
				description
				displayName
				enabled
				name
				runOrder
				usesTeamMemberships
				config {
					configured
					description
					displayName
					key
					value
					secret
				}
			}
		`)
	);
</script>

<Card style="margin-bottom:1rem;">
	<Heading level="2">{$r.displayName}</Heading>
	<p>{$r.description}</p>
	<Switch
		value={$r.enabled}
		on:click={(e) => {
			e.preventDefault();
			confirm = true;
		}}
	>
		Synchronize {$r.displayName}</Switch
	>
	{#if $r.config.length > 0}
		<Accordion>
			<AccordionItem heading="Configuration">
				{#each $r.config as c}
					<TextField value={c.value || ''} style="width:400px"
						><svelte:fragment slot="label">{c.displayName}</svelte:fragment>
						<svelte:fragment slot="description">{c.description}</svelte:fragment>
					</TextField>
				{/each}
				<Button>Save</Button>
			</AccordionItem>
		</Accordion>
	{/if}
</Card>

<Confirm bind:open={confirm}>
	<svelte:fragment slot="header">Confirmation required</svelte:fragment>
	This will <b>{$r.enabled ? 'disable' : 'enable'} </b>synchronization of <i>{$r.displayName}</i><br
	/>
	Are you sure?
</Confirm>
