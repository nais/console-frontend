<script lang="ts">
	import { page } from '$app/state';
	import { replacer } from '$lib/replacer';
	import { Button, Checkbox, Heading, Modal, Select } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import type { FeedbackType } from './types';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	let type: FeedbackType = $state('CHANGE_REQUEST');
	let details = $state('');
	let anonymous: boolean = $state(false);
	let uri = '';

	let feedbackSent: boolean = $state(false);

	let errorMessage: string = '';
	let errorType: boolean = false;
	let errorDetails: boolean = false;

	const maxlength = 3000;

	if (page.route.id !== null) {
		uri = replacer(page.route.id, page.params);
	}

	const FEEDBACK_TYPE: { value: FeedbackType | ''; text: string }[] = [
		{ value: '', text: 'Choose type of feedback' },
		{ value: 'BUG', text: 'Bug' },
		{ value: 'CHANGE_REQUEST', text: 'Change request' },
		{ value: 'QUESTION', text: 'Question' },
		{ value: 'OTHER', text: 'Other' }
	];

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		feedbackSent = false;
		open = false;
		dispatcher('close');
	};

	const submitFeedback = async () => {
		let response = '';
		try {
			const result = await fetch('/api/send-feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					feedback: details,
					type: type,
					path: uri,
					anonymous: anonymous
				})
			});

			const data = await result.json();

			response = data.ok ? 'Message sent!' : 'Failed to send message.';
			feedbackSent = true;
		} catch (error) {
			console.error('Error:', error);
			response = 'Error sending message.';
		}
		return response;
	};
</script>

<Modal bind:open width="medium" onclose={close}>
	{#snippet header()}
		<Heading>Nais Console feedback</Heading>
	{/snippet}

	{#if feedbackSent}
		<p>Thank you for your feedback!</p>
	{:else}
		<p>
			Help us improve Console! We value your input. Feedback will be associated with your logged-in
			email address. To provide feedback anonymously, please check the box below.
		</p>
		<div class="wrapper">
			<Select size="small" label="Type" bind:value={type}>
				{#each FEEDBACK_TYPE as option (option.value)}
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
				></textarea>
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
	{#snippet footer()}
		{#if feedbackSent}
			<Button variant="primary" size="small" onclick={close}>Close</Button>
		{:else}
			<Button variant="primary" size="small" onclick={submitFeedback}>Submit</Button>
			<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
		{/if}
	{/snippet}
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
