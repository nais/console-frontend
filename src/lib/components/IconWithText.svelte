<script lang="ts">
	import { BodyShort, Detail } from '@nais/ds-svelte-community';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		text: string;
		icon?: Snippet | Component;
		size?: 'small' | 'medium' | 'large';
	}

	let { icon, size = 'medium', text }: Props = $props();

	const TextComponent = size === 'small' ? Detail : BodyShort;

	const isSnippet = (value: Component | Snippet): value is Snippet => value.length === 1;
</script>

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
		{text}
	</TextComponent>
</div>

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
		font-size: 1.125rem;
		gap: var(--a-spacing-1-alt);
	}
	.icon-with-text--large {
		font-size: 1.25rem;
		gap: var(--a-spacing-2);
	}
</style>
