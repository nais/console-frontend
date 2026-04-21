<script lang="ts">
	import Confirm from '$lib/ui/Confirm.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
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
	import { untrack } from 'svelte';
	import {
		DisableReconcilerMutation,
		EnableReconcilerMutation,
		ReconcilerFragment,
		SaveReconcilerConfigMutation
	} from './reconcilers';

	interface Props {
		reconciler: FragmentType<typeof ReconcilerFragment>;
	}

	let { reconciler }: Props = $props();

	const client = getContextClient();

	let confirm = $state(false);
	let errors: string[] = $state([]);
	let configErrors: string[] = $state([]);
	let reconcileLoading = $state(false);
	let configLoading = $state(false);

	let r = $derived(useFragment(ReconcilerFragment, reconciler));

	const toggle = async () => {
		errors = [];
		reconcileLoading = true;
		try {
			const resp = r.enabled
				? await client.mutation(DisableReconcilerMutation, { name: r.name }).toPromise()
				: await client.mutation(EnableReconcilerMutation, { name: r.name }).toPromise();

			if (resp.error) {
				errors = (resp.error.graphQLErrors ?? [])
					.filter((e) => e.message != 'unable to resolve')
					.map((e) => e.message);
				if (errors.length === 0 && resp.error.message) {
					errors = [resp.error.message];
				}
			}
		} catch (error) {
			errors = [error instanceof Error ? error.message : 'Failed to update reconciler state'];
		} finally {
			reconcileLoading = false;
		}
	};

	// We do not submit secrets with no value
	let config: { key: string; value: string; secret: boolean }[] = $state([]);

	$effect(() => {
		untrack(() => {
			if (config.length > 0) {
				return;
			}

			config = r.config.map((c) => {
				return { key: c.key, value: c.value || '', secret: c.secret };
			});
		});
	});

	const saveConfig = async () => {
		configErrors = [];
		configLoading = true;

		const resp = await client
			.mutation(SaveReconcilerConfigMutation, {
				name: r.name,
				config: config
					.filter((c) => {
						return !c.secret || !!c.value;
					})
					.map((c) => ({ key: c.key, value: c.value }))
			})
			.toPromise();

		configLoading = false;
		if (resp.error) {
			errors = (resp.error.graphQLErrors ?? [])
				.filter((e) => e.message != 'unable to resolve')
				.map((e) => e.message);
			if (errors.length === 0 && resp.error.message) {
				errors = [resp.error.message];
			}
		}
	};
</script>

<!-- <Card style="margin-bottom:1rem;"> -->
<div class="card">
	<Heading as="h2">{r.displayName}</Heading>
	{#if r.errors.pageInfo.totalCount}
		<span class="reconciler-error">
			Reconciler has {r.errors.pageInfo.totalCount} errors. Please consult the
			<a href="/admin/reconcilerLogs/{r.id}">logs</a> 🙏
		</span>
	{/if}
	<p>{r.description}</p>

	{#each errors as error (error)}
		<Alert variant="error">{error}</Alert>
	{/each}

	<Switch
		checked={r.enabled}
		loading={reconcileLoading}
		disabled={reconcileLoading}
		onclick={(e: MouseEvent) => {
			e.preventDefault();
			confirm = true;
		}}
	>
		Synchronize {r.displayName}</Switch
	>
	{#if r.config.length > 0 && config.length > 0}
		<Accordion>
			<AccordionItem heading="Configuration">
				<form
					onsubmit={(e: SubmitEvent) => {
						e.preventDefault();
						saveConfig();
					}}
				>
					{#each configErrors as error (error)}
						<Alert variant="error">{error}</Alert>
					{/each}

					{#each r.config as c, i (c.key)}
						<TextField bind:value={config[i].value} style="width:400px">
							{#snippet label()}
								{c.displayName}
							{/snippet}
							{#snippet description()}
								{c.description}
								{#if c.secret && c.configured}
									<br />
									<InformationSquareFillIcon /> This value is already configured. It is hidden because
									it is secret.
								{/if}
							{/snippet}
						</TextField>
					{/each}
					<Button loading={configLoading} disabled={configLoading}>Save</Button>
				</form>
			</AccordionItem>
		</Accordion>
	{/if}
	<!-- </Card> -->
</div>
<Confirm bind:open={confirm} onconfirm={toggle}>
	{#snippet header()}
		Confirmation required
	{/snippet}
	This will <b>{r.enabled ? 'disable' : 'enable'}</b> synchronization of <i>{r.displayName}</i><br
	/>
	Are you sure?
</Confirm>

<style>
	.reconciler-error {
		color: var(--ax-text-danger);
	}
	.card {
		margin-bottom: 1rem;
		background-color: var(--ax-bg-sunken);
		border-radius: 12px;
		align-items: stretch;
		border: 1px solid var(--ax-border-neutral);
		padding: var(--ax-space-20);
	}
</style>
