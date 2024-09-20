<script lang="ts">
	import { graphql } from '$houdini';
	import { Alert, Button } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Reconciler from './Reconciler.svelte';

	export let data: PageData;

	$: ({ AdminReconcilers } = data);
	$: reconcilers = $AdminReconcilers.data?.reconcilers.nodes;

	const synchronize = graphql(`
		mutation Synchronize {
			synchronizeAllTeams {
				correlationID
			}
		}
	`);

	let errors: string[] = [];

	let loading = false;
	const triggerSynchronize = async () => {
		loading = true;
		const resp = await synchronize.mutate(null);
		loading = false;

		if (resp.errors) {
			errors = resp.errors.filter((e) => e.message != 'unable to resolve').map((e) => e.message);
		}
	};
</script>

<div class="h">
	<Button disabled={loading} {loading} on:click={triggerSynchronize} size="small">
		Synchronize all teams
	</Button>
</div>
<br />

{#each errors as e}
	<Alert variant="error">{e}</Alert>
{/each}

{#each reconcilers || [] as r}
	<Reconciler reconciler={r} />
{:else}
	<p>No reconcilers registered</p>
{/each}

<style>
	.h {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
</style>
