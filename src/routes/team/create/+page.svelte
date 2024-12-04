<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/Card.svelte';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Button, ErrorSummary, TextField } from '@nais/ds-svelte-community';
	import { FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	import type { ActionData } from './$types';

	export let form: ActionData;
	let feedbackOpen = false;
	let saving = false;
	let slackChannelError = '';
	let teamSlugError = '';

	const reservedSlugs = [
		'nais-system',
		'kube-system',
		'kube-node-lease',
		'kube-public',
		'kyverno',
		'cnrm-system',
		'configconnector-operator-system',
		'default'
	];
	const slugPattern = /^[a-z](-?[a-z0-9]+)+$/;
	const slackChannelPattern = /^[a-z0-9_-]{1,80}$/;

	function handleTeamSlugInput(event: Event) {
		const input = event.target as HTMLInputElement | null;
		if (input) {
			const slug = input.value;

			// Check if the slug is reserved
			if (reservedSlugs.includes(slug)) {
				teamSlugError = 'This slug is reserved by NAIS.';
				return;
			}

			// Check if the slug starts with "nais"
			if (slug.startsWith('nais')) {
				teamSlugError =
					"The name prefix 'nais' is reserved by NAIS. Try again with a different name, perhaps just removing the prefix?";
				return;
			}

			// Check if the slug starts with "team"
			if (slug.startsWith('team')) {
				teamSlugError =
					"The name prefix 'team' is redundant. When you create a team, it is by definition a team. Try again with a different name, perhaps just removing the prefix?";
				return;
			}

			// Check the length of the slug
			if (slug.length < 3) {
				teamSlugError = 'A team slug must be at least 3 characters long.';
				return;
			}

			if (slug.length > 30) {
				teamSlugError = 'A team slug must be at most 30 characters long.';
				return;
			}

			// Validate the slug against the pattern
			if (!slugPattern.test(slug)) {
				teamSlugError =
					'A team slug must start with a lowercase letter and can contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.';
				return;
			}

			// If all validations pass, clear the error
			teamSlugError = '';
		}
	}

	function handleSlackChannelInput(event: Event) {
		const input = event.target as HTMLInputElement | null;
		if (input) {
			let cursorPosition = input.selectionStart ?? 0;
			let value = input.value;

			// Ensure the input value starts with a single '#'
			if (!value.startsWith('#')) {
				value = '#' + value.replace(/^#+/, '');
				cursorPosition++;
			} else {
				value = '#' + value.slice(1).replace(/^#+/, '');
			}

			// Set the corrected value back to the input
			input.value = value;

			// Move cursor to the correct position
			if (cursorPosition <= 1) {
				input.setSelectionRange(1, 1); // Move cursor after the '#'
			} else {
				input.setSelectionRange(cursorPosition, cursorPosition);
			}

			// Validate the Slack channel name
			const slackChannelName = input.value.slice(1); // Remove the leading '#'
			const isValid = slackChannelPattern.test(slackChannelName);

			if (!isValid) {
				slackChannelError =
					'Invalid Slack channel name. It must contain only lowercase letters, numbers, hyphens, and underscores, and be between 1 and 80 characters long.';
			} else {
				slackChannelError = '';
			}
		}
		if (form && input) {
			form.input.slackChannel = input.value;
		}
	}
</script>

<div class="container">
	<div class="feedback">
		<Button
			variant="secondary"
			size="xsmall"
			on:click={() => {
				feedbackOpen = true;
			}}>Feedback</Button
		>
	</div>
	<Card>
		<h1>Create new team</h1>
		{#if form?.errors && form.errors.length > 0}
			<ErrorSummary heading="Error creating team">
				{#each form.errors as error}
					<li style="color:inherit!important">{error.message}</li>
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
		<form
			method="POST"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					saving = false;
					update({ reset: false });
				};
			}}
		>
			<TextField name="name" value={form?.input.slug} on:input={handleTeamSlugInput}>
				<svelte:fragment slot="label">Identifier / Name</svelte:fragment>
				<svelte:fragment slot="description">
					Example: my-team-name<br />
					<WarningIcon style="color:var(--a-icon-warning)" /> It is not possible to change the identifier
					after creation, so choose wisely. Also, the identifier can not start with "nais" or "team".
				</svelte:fragment>
			</TextField>
			{#if teamSlugError && teamSlugError !== ''}
				<p style="color:var(--a-text-danger)">{teamSlugError}</p>
			{/if}
			<br />
			<TextField name="description" value={form?.input.purpose}>
				<svelte:fragment slot="label">Purpose of the team</svelte:fragment>
				<svelte:fragment slot="description">
					Example: Making sure users have a good experience
				</svelte:fragment>
			</TextField>
			<br />
			<TextField
				name="slackChannel"
				value={form?.input.slackChannel}
				on:input={handleSlackChannelInput}
			>
				<svelte:fragment slot="label">Slack channel</svelte:fragment>
				<svelte:fragment slot="description">Example: #my-team-slack</svelte:fragment>
			</TextField>
			{#if slackChannelError && slackChannelError !== ''}
				<p style="color:var(--a-text-danger)">{slackChannelError}</p>
			{/if}
			<br />
			<Button loading={saving} disabled={Boolean(slackChannelError) || Boolean(teamSlugError)}>
				<svelte:fragment slot="icon-left"><FloppydiskIcon /></svelte:fragment>
				Create team
			</Button>
		</form>
	</Card>
</div>

{#if feedbackOpen}
	<Feedback bind:open={feedbackOpen} />
{/if}

<style>
	.container {
		margin: auto;
		max-width: 1432px;
	}
	.feedback {
		display: flex;
		justify-content: flex-end;
	}
</style>
