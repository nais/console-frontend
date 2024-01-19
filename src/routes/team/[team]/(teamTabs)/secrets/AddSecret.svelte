<script lang="ts">
	import { graphql, type SecretTupleInput } from '$houdini';
	import {
		Button,
		Heading,
		Modal,
		TextField
	} from '@nais/ds-svelte-community';
	import { FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	export let open: boolean;
	export let team: string;
	export let env: string;
	export let refetch;

	let name: string = 'Secret name';
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
		open = false;
		refetch()
	};

</script>

<Modal bind:open width="small">
	<svelte:fragment slot="header">
		<Heading>Add new secret to <b>{env}</b></Heading>
	</svelte:fragment>

	<TextField hideLabel size="small" htmlSize={14} bind:value={name} />

	<svelte:fragment slot="footer">
		<Button
			type="submit"
			variant="primary"
			size="small"
			on:click={submit}>
			<FloppydiskIcon />
			Save
		</Button>
	</svelte:fragment>
</Modal>

<style>

</style>
