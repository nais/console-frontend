<script lang="ts">
	import { page } from '$app/stores';
	import { ConsoleUserFeedbackType, graphql, type ValueOf } from '$houdini';
	import { logEvent } from '$lib/amplitude';
	import { replacer } from '$lib/replacer';
	import { Button, Checkbox, Heading, Modal, Select } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;

	let type: ValueOf<typeof ConsoleUserFeedbackType> | '' = '';
	let details = '';
	let anonymous: boolean = false;
	let uri = '';

	let feedbackSent: boolean = false;

	let errorMessage: string = '';
	let errorType: boolean = false;
	let errorDetails: boolean = false;

	const maxlength = 3000;

	if ($page.route.id !== null) {
		uri = replacer($page.route.id, $page.params);
	}

	const FEEDBACK_TYPE = [
		{ value: '', text: 'Choose type of feedback' },
		{ value: ConsoleUserFeedbackType.BUG, text: 'Bug' },
		{ value: ConsoleUserFeedbackType.CHANGE_REQUEST, text: 'Change request' },
		{ value: ConsoleUserFeedbackType.QUESTION, text: 'Question' },
		{ value: ConsoleUserFeedbackType.OTHER, text: 'Other' }
	];

	const submitFeedback = async () => {
		errorMessage = '';
		errorType = false;
		errorDetails = false;

		if (!type) {
			errorType = true;
			return;
		}

		if (details === '') {
			errorDetails = true;
			return;
		}

		if (uri === '') {
			errorMessage = 'Not able to get uri';
			return;
		}

		await feedback.mutate({
			anonymous: anonymous,
			details: details,
			uri: uri,
			type: type
		});

		if ($feedback.data?.reportConsoleUserFeedback.reported) {
			logEvent('feedback');
			feedbackSent = true;
			return;
		}

		if ($feedback.errors) {
			if (errorMessage === '') {
				errorMessage = $feedback.errors[0].message;
			}
			open = true;
			return;
		}

		close();
	};

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		feedbackSent = false;
		open = false;
		dispatcher('close');
	};

	const feedback = graphql(`
		mutation reportConsoleUserFeedback(
			$details: String!
			$uri: String!
			$anonymous: Boolean!
			$type: ConsoleUserFeedbackType!
		) {
			reportConsoleUserFeedback(
				input: { feedback: $details, path: $uri, anonymous: $anonymous, type: $type }
			) {
				reported
			}
		}
	`);
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Console feedback</Heading>
	</svelte:fragment>

	{#if feedbackSent}
		<p>Thank you for your feedback!</p>
	{:else}
		<p>
			Help us improve Console! We value your input. Feedback will be associated with your logged-in
			email address. To provide feedback anonymously, please check the box below.
		</p>
		<div class="wrapper">
			<Select size="small" label="Type" bind:value={type}>
				{#each FEEDBACK_TYPE as option}
					<option value={option.value}>{option.text}</option>
				{/each}
			</Select>
			{#if errorType}
				<p class="navds-error-message navds-label navds-label--small">
					Please provide type of feedback
				</p>
			{/if}

			<label class="navds-form-field__label navds-label navds-label--small" for="details">
				Details
			</label>
			<div class="details">
				<textarea
					class="navds-textarea__input navds-body-short navds-body-short--small textarea"
					id="details"
					bind:value={details}
					rows="5"
					cols="40"
					{maxlength}
					style="resize: vertical; min-height: 16rem; "
					placeholder="Enter your feedback here..."
					disabled={feedbackSent}
				/>
				<span id="charCount"
					>{maxlength - details.length} character{maxlength - details.length == 1 ? '' : 's'} remaining</span
				>
			</div>
			<div
				class="navds-form-field__error"
				id="tf-uid-43"
				aria-relevant="additions removals"
				aria-live="polite"
			>
				{#if errorDetails}
					<p class="navds-error-message navds-label navds-label--small">
						Please provide feedback details
					</p>
				{/if}
			</div>
			{#if errorMessage !== ''}
				<p class="navds-error-message navds-label navds-label--small">{errorMessage}</p>
			{/if}
		</div>
		<Checkbox bind:checked={anonymous}>Anonymous feedback</Checkbox>
	{/if}
	<svelte:fragment slot="footer">
		{#if feedbackSent}
			<Button variant="primary" size="small" on:click={close}>Close</Button>
		{:else}
			<Button variant="primary" size="small" on:click={submitFeedback}>Submit</Button>
			<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
		{/if}
	</svelte:fragment>
</Modal>

<style>
	.wrapper {
		border: 1px solid #d6d8db;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;
	}
	.details {
		display: flex;
		flex-direction: column;
		align-items: end;
	}
	#charCount {
		font-size: 0.75rem;
		color: var(--a-text-subtle);
		margin: 0;
		padding-top: 0.2rem;
	}
</style>
