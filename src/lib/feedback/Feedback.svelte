<script lang="ts">
	import { page } from '$app/state';
	import { replacer } from '$lib/replacer';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { Button, Checkbox, Heading, Modal, Select, Theme } from '@nais/ds-svelte-community';
	import type { FeedbackType } from './types';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();

	let type: FeedbackType | '' = $state('');
	let details = $state('');
	let anonymous: boolean = $state(false);
	let uri = '';

	let loading = $state(false);
	let feedbackSent: boolean = $state(false);

	let errorMessage: string = $state('');
	let errorType: boolean = $state(false);
	let errorDetails: boolean = $state(false);

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

	const submitFeedback = async () => {
		if (type === '') {
			errorType = true;
		} else {
			errorType = false;
		}

		if (details === '' || details === undefined) {
			errorDetails = true;
		} else {
			errorDetails = false;
		}

		if (errorType || errorDetails) {
			return;
		}

		loading = true;
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
			loading = false;
			const data = await result.json();

			if (data.error) {
				errorMessage = data.error;
				return;
			}

			response = data.ok ? 'Message sent!' : 'Failed to send message.';
			feedbackSent = true;
		} catch (error) {
			console.error('Error:', error);
			response = 'Error sending message: ' + error;
		}
		return response;
	};
</script>

<Theme theme={themeSwitch.theme}>
	<Modal open width="medium" onclose={close}>
		{#snippet header()}
			<Heading level="1">Nais Console Feedback</Heading>
		{/snippet}

		{#if feedbackSent}
			<p>Thank you for your feedback!</p>
		{:else}
			<p>
				Help us improve Console! We value your input. Feedback will be associated with your
				logged-in email address. To provide feedback anonymously, check the box below.
			</p>
			<div class="wrapper">
				<Select size="small" label="Type" bind:value={type}>
					{#each FEEDBACK_TYPE as option (option)}
						<option value={option.value}>{option.text}</option>
					{/each}
				</Select>
				{#if errorType}
					<p class="aksel-error-message aksel-label aksel-label--small">Feedback type required</p>
				{/if}

				<label class="aksel-form-field__label aksel-label aksel-label--small" for="details">
					Details
				</label>
				<div class="details">
					<textarea
						class="aksel-textarea__input aksel-body-short aksel-body-short--small textarea"
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
					class="aksel-form-field__error"
					id="tf-uid-43"
					aria-relevant="additions removals"
					aria-live="polite"
				>
					{#if errorDetails}
						<p class="aksel-error-message aksel-label aksel-label--small">
							Feedback details required
						</p>
					{/if}
				</div>
				{#if errorMessage !== ''}
					<p class="aksel-error-message aksel-label aksel-label--small">{errorMessage}</p>
				{/if}
				<Checkbox bind:checked={anonymous}>Anonymous feedback</Checkbox>
			</div>
		{/if}
		{#snippet footer()}
			{#if feedbackSent}
				<Button variant="primary" size="small" onclick={close}>Close</Button>
			{:else}
				<Button variant="primary" size="small" {loading} onclick={submitFeedback}>Submit</Button>
				<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
			{/if}
		{/snippet}
	</Modal>
</Theme>

<style>
	.wrapper {
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
		color: var(--ax-text-subtle, --a-text-subtle);
		margin: 0;
		padding-top: 0.2rem;
	}
</style>
