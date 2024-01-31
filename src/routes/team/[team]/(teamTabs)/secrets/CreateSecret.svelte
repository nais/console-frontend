<script lang="ts">
	import { graphql, type SecretTupleInput } from '$houdini';
	import {
		Alert,
		Button,
		Heading,
		Modal,
		TextField
	} from '@nais/ds-svelte-community';

	export let open: boolean;
	export let team: string;
	export let env: string;
	export let refetch: () => void;

	let name: string;
	let data: SecretTupleInput[] = [];

	const createSecret = graphql(`
		mutation createSecret($name: String!, $team: Slug!, $env: String!, $data: [SecretTupleInput!]!) {
			createSecret(name: $name, team: $team, env: $env, data: $data) {
				id
				data {
					key
					value
				}
			}
		}
	`);

	const submit = async () => {
		await createSecret.mutate({
			name: name,
			team: team,
			env: env,
			data: data
		});
		if ($createSecret.errors) {
			open = true

		} else {
			open = false
			refetch()
		}
	};

</script>

<Modal bind:open width="small">
	<svelte:fragment slot="header">
		<Heading>Create new secret in <b>{env}</b></Heading>
	</svelte:fragment>
	<div>
		<TextField size="small" htmlSize={30} bind:value={name} placeholder="New secret name" />
		{#if $createSecret.errors }
			<Alert variant="error">{$createSecret.errors[0].message}</Alert>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={submit}>
			Create
		</Button>
	</svelte:fragment>
</Modal>

<style>
	div {
			padding: 16px;
	}

	div > :global(*) {
			margin-bottom: 32px;
	}
</style>
