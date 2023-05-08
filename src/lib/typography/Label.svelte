<script lang="ts">
	import '@navikt/ds-css/typography.css';
	import { classes } from '../helpers';

	/**
	 * medium: 18px, small: 16px
	 * @default "medium"
	 */
	export let size: 'medium' | 'small' = 'medium';
	/**
	 * Adds margin-bottom
	 */
	export let spacing = false;

	/**
	 * Tag to use for the label
	 */
	export let as: 'label' | 'legend' | 'span' = 'label';
</script>

<svelte:element
	this={as}
	{...$$restProps}
	class={classes($$restProps, 'navds-label')}
	class:navds-label--small={size == 'small'}
	class:navds-label--spacing={spacing}
>
	<slot />
</svelte:element>
