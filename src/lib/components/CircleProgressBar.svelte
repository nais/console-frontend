<script>
	export let size = '50px';
	export let progress;
	const angle = 360 * progress;
	const background = `radial-gradient(white 50%, transparent 51%),
    conic-gradient(transparent 0deg ${angle}deg, gainsboro ${angle}deg 360deg),
    conic-gradient(green 0deg, green 90deg, orange 240deg, red);`;
	$: cssVarStyles = `--background:${background};--size:${size}`;
</script>

<div id="progress-circle" style={cssVarStyles}><slot /></div>

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
