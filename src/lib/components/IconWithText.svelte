<script lang="ts">
	import { BodyShort, Detail, Heading } from '@nais/ds-svelte-community';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		text: string | Snippet;
		description?: string | Snippet;
		icon?: Snippet | Component;
		size?: 'small' | 'medium' | 'large';
	}

	let { icon, size = 'medium', text, description }: Props = $props();

	const TextComponent = size === 'small' ? Detail : size === 'large' ? Heading : BodyShort;

	const isSnippet = (value: Component | Snippet): value is Snippet => value.length === 1;
</script>

{#if description}
	<div class="icon-with-text icon-with-text--{size}">
		{#if icon}
			{#if isSnippet(icon)}
				{@render icon()}
			{:else}
				{@const Icon = icon}
				<Icon />
			{/if}
		{/if}
		<div>
			<TextComponent>
				{#if typeof text === 'string'}
					{text}
				{:else}
					{@render text()}
				{/if}
			</TextComponent>
			{#if typeof description === 'string'}
				<Detail style="font-weight: normal; color: var(--a-text-subtle);">{description}</Detail>
			{:else}
				{@render description()}
			{/if}
		</div>
	</div>
{:else}
	<div class="icon-with-text icon-with-text--{size}">
		{#if icon}
			{#if isSnippet(icon)}
				{@render icon()}
			{:else}
				{@const Icon = icon}
				<Icon />
			{/if}
		{/if}
		<TextComponent>
			{#if typeof text === 'string'}
				{text}
			{:else}
				{@render text()}
			{/if}
		</TextComponent>
	</div>
{/if}

<style>
	.icon-with-text {
		display: flex;
		align-items: center;
	}
	.icon-with-text--small {
		font-size: 0.75rem;
		gap: var(--a-spacing-1);
	}
	.icon-with-text--medium {
		font-size: 1.25rem;
		gap: var(--a-spacing-1-alt);
	}
	.icon-with-text--large {
		font-size: 1.5rem;
		gap: var(--a-spacing-3);
	}
</style>
