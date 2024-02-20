<script lang="ts">
	import Card from '$lib/Card.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Button, ErrorSummary, ErrorSummaryItem, TextField } from '@nais/ds-svelte-community';
	import { FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
	let saving = false;
</script>

<div class="container">
	<Card>
		<h1>Create new team</h1>
		{#if form?.errors && form.errors.length > 0}
			<ErrorSummary heading="Error creating team">
				{#each form.errors as error}
					<ErrorSummaryItem href="">{error.message}</ErrorSummaryItem>
				{/each}
			</ErrorSummary>
		{/if}
		<p>
			Creating a team in NAIS Teams will grant access to certain NAIS features, such as Google Cloud
			projects, Kubernetes namespaces, or your own GitHub team. After the team is created, you will
			become the administrator of that team, granting privileges to add and remove team members. The
			identifier is the primary key, and will be used across systems so that they are easily
			recognizable.
		</p>
		<form method="POST" use:enhance on:submit={() => (saving = !saving)}>
			<TextField name="name">
				<svelte:fragment slot="label">Identifier / Name</svelte:fragment>
				<svelte:fragment slot="description"
					>Example: my-team-name<br />

					<WarningIcon style="color:var(--a-icon-warning)" /> It is not possible to change the identifier
					after creation, so choose wisely. Also, the identifier can not start with "nais" or "team".
				</svelte:fragment>
			</TextField>
			<br />
			<TextField name="description"
				><svelte:fragment slot="label">Purpose of the team</svelte:fragment>
				<svelte:fragment slot="description"
					>Example: Making sure users have a good experience</svelte:fragment
				>
			</TextField>
			<br />
			<TextField name="slackChannel"
				><svelte:fragment slot="label">Slack channel</svelte:fragment>
				<svelte:fragment slot="description">Example: #my-team-slack</svelte:fragment>
			</TextField>
			<br />
			<Button loading={saving}
				><svelte:fragment slot="icon-left"><FloppydiskIcon /></svelte:fragment>Create team</Button
			>
		</form>
	</Card>
</div>

<style>
	.container {
		margin: auto;
		max-width: 1432px;
	}
</style>
