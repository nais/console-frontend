<script lang="ts">
	import { BodyShort, Detail, Heading, Link } from '@nais/ds-svelte-community';
	import type { HeadingProps } from '@nais/ds-svelte-community/components/typography/Heading/type.js';
	import type { Component } from 'svelte';

	const {
		label,
		href,
		icon: Icon,
		description,
		...rest
	}: {
		label: Component | string;
		href?: string;
		icon: Component;
		description?: Component | string;
	} & (
		| {
				size?: 'small' | 'medium';
		  }
		| {
				size: 'large';
				level: HeadingProps['level'];
		  }
	) = $props();
</script>

{#snippet linkOrText()}
	{#if href}
		<Link {href}>{@render componentOrString(label)}</Link>
	{:else}
		{@render componentOrString(label)}
	{/if}
{/snippet}

{#snippet componentOrString(Value: Component | string)}
	{#if typeof Value === 'string'}
		{Value}
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
	<Icon />
	<div>
		{#if rest.size === 'small'}
			<Detail>{@render linkOrText()}</Detail>
		{:else if rest.size === 'large'}
			<Heading size="small" level={rest.level}>{@render linkOrText()}</Heading>
		{:else}
			<BodyShort>{@render linkOrText()}</BodyShort>
		{/if}
		{#if description}
			<Detail>{@render componentOrString(description)}</Detail>
		{/if}
	</div>
</div>

<style>
	.icon-label {
		display: flex;
		align-items: center;
		gap: var(--a-spacing-2);
		font-size: 1.25rem;

		> * {
			flex: 1 1 0;
		}

		:global(a) {
			color: inherit;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}

			&:active,
			&:focus-visible {
				color: var(--ac-link-focus-text, var(--a-text-on-action));
			}
		}
	}
	.icon-label--small {
		gap: var(--a-spacing-1);
		font-size: var(--a-font-size-small);
	}
	.icon-label--medium {
		gap: var(--a-spacing-2);
	}
	.icon-label--large {
		gap: var(--a-spacing-2);
	}
	.icon-label--with-desc {
		font-size: 1.5rem;
	}
	.icon-label--large.icon-label--with-desc {
		gap: var(--a-spacing-3);
	}
</style>
