<script lang="ts">
	import '@navikt/ds-css/button.css';
	import Loading from './Loading.svelte';
	import { classes, omit } from './helpers';
	import Label from './typography/Label.svelte';

	/**
	 * Changes design and interaction-visuals
	 */
	export let variant:
		| 'primary'
		| 'primary-neutral'
		| 'secondary'
		| 'secondary-neutral'
		| 'tertiary'
		| 'tertiary-neutral'
		| 'danger' = 'primary';
	/**
	 * Changes padding, height and font-size
	 * @default medium
	 */
	export let size: 'medium' | 'small' | 'xsmall' = 'medium';
	/**
	 * Prevent the user from interacting with the button: it cannot be pressed or focused.
	 * @note Avoid using if possible for accessibility purposes
	 */
	export let disabled = false;
	/**
	 * Replaces button content with a Loader component, keeps width
	 * @default false
	 */
	export let loading = false;

	/**
	 * Tag to use for the button
	 */
	export let as: 'button' | 'a' = 'button';

	/**
	 * Icon only
	 */
	export let iconOnly = false;

	export let el: HTMLButtonElement | HTMLAnchorElement | undefined = undefined;

	let overrideWidth = 0;

	$: if (el && loading) {
		overrideWidth = el.getBoundingClientRect().width;
	} else {
		overrideWidth = 0;
	}
</script>

<svelte:element
	this={as}
	{...omit(disabled ? omit($$restProps, 'href') : $$restProps, 'class')}
	style={overrideWidth ? `width: ${overrideWidth}px` : undefined}
	class={classes($$restProps, 'navds-button', `navds-button--${variant}`, `navds-button--${size}`)}
	class:navds-button--loading={loading}
	class:navds-button--disabled={disabled || overrideWidth > 0}
	class:navds-button--icon-only={iconOnly ||
		(($$slots['icon-left'] || $$slots['icon-right']) && !$$slots.default)}
	bind:this={el}
	on:click
>
	{#if overrideWidth}
		<Loading {size} />
	{:else}
		{#if $$slots['icon-left']}
			<span class="navds-button__icon"><slot name="icon-left" /></span>
		{/if}
		{#if $$slots.default && !iconOnly}
			<Label as="span" size={size === 'medium' ? 'medium' : 'small'} aria-live="polite">
				<slot />
			</Label>
		{/if}
		{#if $$slots['icon-right']}
			<span class="navds-button__icon"><slot name="icon-right" /></span>
		{/if}
	{/if}
</svelte:element>
