<script lang="ts">
	import { Alert, Heading } from '@nais/ui';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props {
		class?: HTMLAttributes<HTMLDivElement>['class'];
		errors?: readonly { message: string }[] | null;
		size?: 'medium' | 'small';
		heading?: string;
		headingTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	}

	let {
		errors,
		size = 'medium',
		heading = 'You must fix these errors before you can continue',
		headingTag = 'h2',
		class: className
	}: Props = $props();
</script>

{#if errors?.length}
	<Alert variant="error" {size} class={className}>
		<Heading as={headingTag} size={size === 'small' ? 'xsmall' : 'small'}>{heading}</Heading>
		{#if errors.length === 1}
			<p class="messages">{errors[0].message}</p>
		{:else}
			<ul class="messages">
				{#each errors as error (error)}
					<li>{error.message}</li>
				{/each}
			</ul>
		{/if}
	</Alert>
{/if}

<style>
	.messages {
		margin: var(--nais-space-4) 0 0;
		color: var(--foreground);
	}

	ul.messages {
		list-style: disc;
		padding-inline-start: var(--nais-space-20);
	}

	li + li {
		margin-block-start: var(--nais-space-4);
	}
</style>
