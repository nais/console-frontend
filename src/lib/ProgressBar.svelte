<script lang="ts">
	let progress = $state(10);

	$effect(() => {
		const id = setInterval(() => {
			progress += (Math.random() * 50) / progress;
		}, 100);

		return () => clearInterval(id);
	});

	export function fade(node: HTMLElement) {
		return {
			delay: 300,
			duration: 1,
			css: (t: number) => `opacity: ${t}`
		};
	}

	function complete(node: HTMLElement) {
		return {
			duration: 200,
			css: (t: number, u: number) => `
                width: ${progress + (100 - progress) * u}vw; 
            `
		};
	}
</script>

<div class="progress-bar" style="width: {progress}vw;" in:fade out:complete></div>

<style>
	.progress-bar {
		position: fixed;
		display: block;
		top: 0;
		left: 0;
		height: 3px;
		background: var(--active-color-strong);
		z-index: 2147483647;
		transition: width 300ms ease-out;
	}
</style>
