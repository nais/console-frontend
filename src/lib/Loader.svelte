<script lang="ts">
	import '@navikt/ds-css/loader.css';
	/**
	 * Changes Loader width/height
	 * 64px | 40px | 32px | 24px | 20px | 16px
	 * @default "medium"
	 */
	export let size: '3xlarge' | '2xlarge' | 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall' =
		'medium';
	/**
	 * Title prop on svg
	 * @default "venter..."
	 */
	export let title = 'venter...';
	/**
	 * Sets svg-background to transparent
	 * @default false
	 */
	export let transparent = false;
	/**
	 * Colored variants for Loader
	 * @default "neutral"
	 */
	export let variant: 'neutral' | 'interaction' | 'inverted' = 'neutral';
</script>

<svg
	class="navds-loader navds-loader--{size} navds-loader--{variant}"
	class:navds-loader--transparent={transparent}
	focusable="false"
	viewBox="0 0 50 50"
	preserveAspectRatio="xMidYMid"
	aria-label={title}
	{...$$restProps}
>
	<circle
		class="navds-loader__background"
		xmlns="http://www.w3.org/2000/svg"
		cx="25"
		cy="25"
		r="20"
		fill="none"
	/>
	<circle
		class="navds-loader__foreground"
		cx="25"
		cy="25"
		r="20"
		fill="none"
		stroke-dasharray="50 155"
	/>
</svg>
