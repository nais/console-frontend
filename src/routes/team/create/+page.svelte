<script lang="ts">
	import { createTeamForm } from '$lib/forms/team';
	import Form from '$lib/ui/Form/Form.svelte';
	import { BodyLong, Heading } from '@nais/ds-svelte-community';
	import { FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	import { Button } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Create a New Team - Nais Console</title>
</svelte:head>

<div class="container">
	<Heading as="h1" size="large" spacing>Create a New Team</Heading>

	<BodyLong spacing>
		Creating a team in Nais will grant access to certain Nais features, such as Google Cloud
		projects, Kubernetes namespaces, or your own GitHub team. After the team is created, you will
		become the administrator of that team, granting privileges to add and remove team members. The
		identifier is the primary key, and will be used across systems so that they are easily
		recognizable.
	</BodyLong>

	<Form fields={createTeamForm} {form}>
		{#snippet button({ submitting })}
			<Button type="submit" size="small" icon={FloppydiskIcon} loading={submitting}>
				Create team
			</Button>
		{/snippet}
	</Form>
</div>

<style>
	.container {
		padding-top: 4rem;
		margin-inline: auto;
		max-width: 620px;
	}
</style>
