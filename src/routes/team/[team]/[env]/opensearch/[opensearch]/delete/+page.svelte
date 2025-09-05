<script lang="ts">
	import { enhance } from '$app/forms';
	import { BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { form }: PageProps = $props();
	let name = $state('');
	const confirmed = $derived(!browser || name === page.params.env + '/' + page.params.opensearch);
</script>

<BodyLong
	>This should contain the steps required to delete a OpenSearch instance, e.g. remove all
	references in all workload manifests.</BodyLong
>

{#if form?.error}
	<ErrorMessage>{form.error}</ErrorMessage>
{/if}

<form method="POST" use:enhance>
	<TextField
		name="name"
		bind:value={name}
		label="Confirm deletion by typing {page.params.env}/{page.params.opensearch}"
	/>
	<Button type="submit" variant="danger" disabled={!confirmed}>Delete OpenSearch</Button>
</form>

<style>
	form {
		max-width: 400px;
	}

	:global(form > *) {
		margin-bottom: 1rem;
	}
</style>
