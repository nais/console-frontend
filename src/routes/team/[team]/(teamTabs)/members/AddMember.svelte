<script lang="ts">
	import {
		Button,
		Checkbox,
		CheckboxGroup,
		Heading,
		Modal,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	const emails = ['1@b.c', '2@b.c', '3@b.c'];
	const reconcilers = ['git', 'bla', 'blo'];
	let selectedRecs = [...reconcilers];
	export let open: boolean;
</script>

<Modal bind:open>
	<svelte:fragment slot="header"><Heading>Add member</Heading></svelte:fragment>

	<div class="wrapper">
		<TextField list="add-member-email" type="email">
			<svelte:fragment slot="label">Email</svelte:fragment>
		</TextField>
		<datalist id="add-member-email">
			{#each emails as email}
				<option value={email} />
			{/each}
		</datalist>

		<Select label="Role" style="width:150px">
			<option value="admin">Admin</option>
			<option value="member">Member</option>
		</Select>

		<CheckboxGroup legend="Enabled features" value={selectedRecs}>
			{#each reconcilers as reconciler}
				<Checkbox value={reconciler}>{reconciler}</Checkbox>
			{/each}
		</CheckboxGroup>
	</div>
	<svelte:fragment slot="footer">
		<Button><svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>Add member</Button>
	</svelte:fragment>
</Modal>

<style>
	.wrapper {
		min-width: 400px;
	}
</style>
