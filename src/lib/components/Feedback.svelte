<script lang="ts">
	import { page } from '$app/stores';
	import { FeedbackType, graphql, type ValueOf } from '$houdini';
	import { logEvent } from '$lib/amplitude';
	import { replacer } from '$lib/replacer';
	import { Button, Checkbox, Heading, Modal, Select } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;

	let type: ValueOf<typeof FeedbackType> | '' = '';
	let details = '';
	let anonymous: boolean = false;
	let uri: string;

	let errormessage: string = '';
	let errorType: boolean = false;
	let errorDetails: boolean = false;

	if ($page.route.id !== null) {
		uri = replacer($page.route.id, $page.params);
	}

	const FEEDBACK_TYPE = [
		{ value: '', text: 'Choose type of feedback' },
		{ value: FeedbackType.BUG, text: 'Bug' },
		{ value: FeedbackType.CHANGE_REQUEST, text: 'Change request' },
		{ value: FeedbackType.QUESTION, text: 'Question' },
		{ value: FeedbackType.OTHER, text: 'Other' }
	];

	const submitFeedback = async () => {
		console.log('type', typeof type);
		console.log('details', details);
		console.log('anon', anonymous);
		console.log('uri', uri);

		errormessage = '';
		errorType = false;

		console.log('error', errormessage);

		// error handling
		if (!type) {
			errorType = true;
			return;
		}

		if (details === '') {
			errorDetails = true;
			return;
		}

		if (uri === null) {
			errormessage = 'Not able to get uri';
			return;
		}

		console.log('error after check', errormessage);

		await feedback.mutate({
			anonymous: anonymous,
			details: details,
			uri: uri,
			type: type
		});

		if ($feedback.data?.createFeedback.created) {
			close();
			return;
		}

		if ($feedback.data?.createFeedback.error) {
			errormessage = $feedback.data.createFeedback.error;
			open = true;
			return;
		}

		if ($feedback.errors) {
			if (errormessage === '') {
				errormessage = $feedback.errors[0].message;
			}
			console.log($feedback.errors);
			open = true;
			return;
		}

		logEvent('feedback');
		errormessage = '';
		errorType = false;
		errorDetails = false;

		details = '';
		anonymous = false;

		close();
	};

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		dispatcher('close');
	};

	const feedback = graphql(`
		mutation createFeedback(
			$details: String!
			$uri: String!
			$anonymous: Boolean!
			$type: FeedbackType!
		) {
			createFeedback(input: { details: $details, uri: $uri, anonymous: $anonymous, type: $type }) {
				created
				error
			}
		}
	`);

	function updateCharCount() {
		const textarea = document.getElementById('details') as HTMLTextAreaElement;
		const charCount = document.getElementById('charCount') as HTMLParagraphElement;

		const remaining = textarea.maxLength - textarea.value.length;
		if (remaining < 0) {
			charCount.textContent = '0 characters remaining';
			return;
		}
		if (remaining === 1) {
			charCount.textContent = '1 character remaining';
			return;
		}
		charCount.textContent = `${remaining} characters remaining`;
	}
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Console feedback</Heading>
	</svelte:fragment>
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

		<!--TextField size="small" readonly value={uri}>
			<svelte:fragment slot="label">URI</svelte:fragment>
		</TextField-->

		<label class="navds-form-field__label navds-label navds-label--small" for="details">
			Details
		</label>
		<div class="details">
			<textarea
				class="navds-textarea__input navds-body-short navds-body-short--small textarea"
				id="details"
				bind:value={details}
				on:input={updateCharCount}
				rows="5"
				cols="40"
				maxlength="3000"
				style="resize: vertical; min-height: 16rem; "
				placeholder="Enter your feedback here..."
			/>
			<span id="charCount">3000 characters remaining</span>
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
		{#if errormessage !== ''}
			<p class="navds-error-message navds-label navds-label--small">{errormessage}</p>
		{/if}
	</div>
	<Checkbox bind:checked={anonymous}>Anonymous feedback</Checkbox>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={submitFeedback}>Submit</Button>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
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
