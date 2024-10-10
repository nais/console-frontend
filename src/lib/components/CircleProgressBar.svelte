<script>
	export let size = '50px';
	export let progress;
	export let startColor = 'green';
	export let endColor = 'red';
	const angle = 360 * progress;
	const background = `radial-gradient(white 50%, transparent 51%),
    conic-gradient(transparent 0deg ${angle}deg, gainsboro ${angle}deg 360deg),
    conic-gradient(${startColor} 0deg, ${startColor} 90deg, orange 240deg, ${endColor});`;
	$: cssVarStyles = `--background:${background};--size:${size};display: grid;place-items: center;`;
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
