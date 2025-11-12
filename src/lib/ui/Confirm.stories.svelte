<script module>
	import { Button, Heading } from '@nais/ds-svelte-community';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Confirm from '$lib/ui/Confirm.svelte';

	const { Story } = defineMeta({
		component: Confirm,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let open1 = $state(false);
	let open2 = $state(false);
	let open3 = $state(false);
</script>

<Story name="Delete resource" asChild>
	<Button variant="danger" onclick={() => (open1 = true)}>Delete Resource</Button>
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={open1}
		onconfirm={() => console.log('Deleted')}
	>
		{#snippet header()}
			<Heading level="1" size="large">Delete Resource</Heading>
		{/snippet}
		<p>Are you sure you want to delete this resource? This action cannot be undone.</p>
	</Confirm>
</Story>

<Story name="Confirm action" asChild>
	<Button onclick={() => (open2 = true)}>Proceed</Button>
	<Confirm
		confirmText="Proceed"
		variant="primary"
		bind:open={open2}
		onconfirm={() => console.log('Confirmed')}
	>
		{#snippet header()}
			<Heading level="1" size="large">Confirm Action</Heading>
		{/snippet}
		<p>Please confirm that you want to proceed with this action.</p>
	</Confirm>
</Story>

<Story name="With additional content" asChild>
	<Button variant="danger" onclick={() => (open3 = true)}>Delete Team</Button>
	<Confirm
		confirmText="Delete Team"
		variant="danger"
		bind:open={open3}
		onconfirm={() => console.log('Team deleted')}
	>
		{#snippet header()}
			<Heading level="1" size="large">Delete Team</Heading>
		{/snippet}
		<p>This will permanently delete the team <b>myteam</b>.</p>
		<p>These resources will be affected:</p>
		<ul>
			<li>5 applications</li>
			<li>2 jobs</li>
			<li>3 secrets</li>
		</ul>
		<p>Are you sure you want to continue?</p>
	</Confirm>
</Story>
