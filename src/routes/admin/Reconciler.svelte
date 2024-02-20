<script lang="ts">
	import { fragment, graphql, type ReconcilerFragment } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Accordion,
		AccordionItem,
		Alert,
		Button,
		Heading,
		Switch,
		TextField
	} from '@nais/ds-svelte-community';
	import { InformationSquareFillIcon } from '@nais/ds-svelte-community/icons';

	export let reconciler: ReconcilerFragment;

	let confirm = false;
	let errors: string[] = [];
	let configErrors: string[] = [];
	let reconcileLoading = false;
	let configLoading = false;

	$: r = fragment(
		reconciler,
		graphql(`
			fragment ReconcilerFragment on Reconciler {
				configured
				description
				displayName
				enabled
				name
				memberAware
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

	const enableReconciler = graphql(`
		mutation EnableReconciler($name: String!) {
			enableReconciler(name: $name) {
				enabled
			}
		}
	`);

	const disableReconciler = graphql(`
		mutation DisableReconciler($name: String!) {
			disableReconciler(name: $name) {
				enabled
			}
		}
	`);

	const toggle = async () => {
		errors = [];
		reconcileLoading = true;
		let resp: { errors?: { message: string }[] | null } = {};
		if ($r.enabled) {
			resp = await disableReconciler.mutate({ name: $r.name });
		} else {
			resp = await enableReconciler.mutate({ name: $r.name });
		}

		reconcileLoading = false;
		if (resp.errors) {
			errors = resp.errors.filter((e) => e.message != 'unable to resolve').map((e) => e.message);
		}
	};

	// We do not submit secrets with no value
	let config: { key: string; value: string; secret: boolean }[] = [];
	$: config = config?.length
		? config
		: $r.config.map((c) => {
				const r = { key: c.key, value: c.value || '', secret: c.secret };
				return r;
		  });

	const saveConfigMutation = graphql(`
		mutation SaveReconcilerConfig($name: String!, $config: [ReconcilerConfigInput!]!) {
			configureReconciler(name: $name, config: $config) {
				configured
			}
		}
	`);

	const saveConfig = async () => {
		configErrors = [];
		configLoading = true;

		const resp = await saveConfigMutation.mutate({
			name: $r.name,
			config: config
				.filter((c) => {
					return !c.secret || !!c.value;
				})
				.map((c) => ({ key: c.key, value: c.value }))
		});

		configLoading = false;
		if (resp.errors) {
			errors = resp.errors.filter((e) => e.message != 'unable to resolve').map((e) => e.message);
		}
	};
</script>

<Card style="margin-bottom:1rem;">
	<Heading level="2">{$r.displayName}</Heading>
	<p>{$r.description}</p>

	{#each errors as error}
		<Alert variant="error">{error}</Alert>
	{/each}

	<Switch
		checked={$r.enabled}
		loading={reconcileLoading}
		disabled={reconcileLoading}
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
				<form on:submit|preventDefault={saveConfig}>
					{#each configErrors as error}
						<Alert variant="error">{error}</Alert>
					{/each}

					{#each $r.config as c, i}
						<TextField bind:value={config[i].value} style="width:400px">
							<svelte:fragment slot="label">{c.displayName}</svelte:fragment>
							<svelte:fragment slot="description">
								{c.description}
								{#if c.secret && c.configured}
									<br />
									<InformationSquareFillIcon /> This value is already configured. It is hidden because
									it is secret.
								{/if}
							</svelte:fragment>
						</TextField>
					{/each}
					<Button loading={configLoading} disabled={configLoading}>Save</Button>
				</form>
			</AccordionItem>
		</Accordion>
	{/if}
</Card>

<Confirm bind:open={confirm} on:confirm={toggle}>
	<svelte:fragment slot="header">Confirmation required</svelte:fragment>
	This will <b>{$r.enabled ? 'disable' : 'enable'} </b>synchronization of <i>{$r.displayName}</i><br
	/>
	Are you sure?
</Confirm>
