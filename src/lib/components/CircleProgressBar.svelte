<script lang="ts">
	interface Props {
		size?: string;
		progress: number;
		startColor?: string;
		endColor?: string;
		children?: import('svelte').Snippet;
	}

	let {
		size = '50px',
		progress,
		startColor = 'green',
		endColor = 'red',
		children
	}: Props = $props();
	const angle = 360 * progress;
	const background = `radial-gradient(white 50%, transparent 51%),
    conic-gradient(transparent 0deg ${angle}deg, gainsboro ${angle}deg 360deg),
    conic-gradient(${startColor} 0deg, ${startColor} 90deg, orange 240deg, ${endColor});`;
	let cssVarStyles = $derived(
		`--background:${background};--size:${size};display: grid;place-items: center;`
	);
</script>

<div id="progress-circle" style={cssVarStyles}>{@render children?.()}</div>

<style>
	#progress-circle {
		background: var(--background);
		border-radius: 50%;
		width: var(--size);
		height: var(--size);
		transition: all 500ms ease-in;
		will-change: transform;
	}
</style>
