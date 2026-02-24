<script lang="ts">
	import { BodyShort, Detail, Heading, Tag } from '@nais/ds-svelte-community';
	import type { TagProps } from '@nais/ds-svelte-community/components/Tag/type.js';
	import type { HeadingProps } from '@nais/ds-svelte-community/components/typography/Heading/type.js';
	import type { Component, Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	const {
		label,
		href,
		icon,
		description,
		tag,
		onclick,
		...rest
	}: {
		label: Snippet | Component | string;
		href?: string;
		icon: Snippet | Component | string;
		description?: Snippet | Component | string;
		tag?: {
			label: string;
			variant: TagProps['variant'];
		};
		onclick?: () => void;
	} & (
		| {
				size?: 'small' | 'medium';
		  }
		| {
				size: 'large';
				as: HeadingProps['as'];
		  }
	) = $props();

	const isSnippet = (value: Component | Snippet): value is Snippet => value.length === 1;
</script>

{#snippet linkOrText()}
	{#if href}
		<a {href} {onclick}>{@render componentOrString(label)}</a>
	{:else}
		{@render componentOrString(label)}
	{/if}
{/snippet}

{#snippet componentOrString(Value: Snippet | Component | string)}
	{#if typeof Value === 'string'}
		{Value}
	{:else if isSnippet(Value)}
		{@render Value()}
	{:else}
		<Value />
	{/if}
{/snippet}

<div
	class={[
		'icon-label',
		`icon-label--${rest.size ?? 'medium'}`,
		{ 'icon-label--with-desc': !!description }
	]}
>
	{#if typeof icon === 'string'}
		<Icon {icon} />
	{:else if isSnippet(icon)}
		{@render icon()}
	{:else}
		{@const Icon = icon}
		<Icon />
	{/if}
	<div class="content">
		{#if rest.size === 'small'}
			<Detail>{@render linkOrText()}</Detail>
		{:else if rest.size === 'large'}
			<Heading size="small" as={rest.as}>{@render linkOrText()}</Heading>
		{:else}
			<BodyShort>{@render linkOrText()}</BodyShort>
		{/if}
		{#if tag || description}
			<div class="desc">
				{#if tag}
					<Tag size="small" variant={tag.variant}>{tag.label}</Tag>
				{/if}
				{#if description}
					<Detail>{@render componentOrString(description)}</Detail>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.desc {
		display: flex;
		gap: var(--ax-space-4);
		align-items: center;
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}
	.label-tag-wrapper {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.icon-label {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		font-size: 1.25rem;

		> * {
			flex: 1 1 0;
		}

		a {
			color: inherit;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}

			&:active,
			&:focus-visible {
				color: var(--ac-link-focus-text, var(--ax-text-neutral));
			}
		}
	}
	.icon-label--small {
		gap: var(--ax-space-4);
		font-size: var(--ax-font-size-small);
	}
	.icon-label--medium {
		gap: var(--ax-space-8);
	}
	.icon-label--large {
		gap: var(--ax-space-8);
	}
	.icon-label--with-desc {
		font-size: 1.5rem;
	}
	.icon-label--large.icon-label--with-desc {
		gap: var(--ax-space-12);
	}
</style>
