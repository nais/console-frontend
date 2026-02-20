<script lang="ts">
	let {
		size = '32'
	}: {
		size: string;
	} = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 64 64"
	width={size}
	height={size}
	aria-label="Muskox typing indicator"
>
	<style>
		:root {
			--muskox-fur-main: #5d4037; /* Light Brown */
			--muskox-fur-shadow: #3e2723; /* Dark Brown */
			--muskox-horn: #d7ccc8; /* Horn Beige */
			--muskox-eye: #1a1a1a; /* Near Black */
		}

		/* Dark Mode Overrides */
		@media (prefers-color-scheme: dark) {
			:root {
				--muskox-fur-main: #8d6e63; /* Lighter, warmer brown */
				--muskox-fur-shadow: #5d4037; /* Medium brown */
				--muskox-horn: #efebe9; /* Brighter ivory */
				--muskox-eye: #000000;
			}
		}

		.fur-main {
			fill: var(--muskox-fur-main);
		}
		.fur-shadow {
			fill: var(--muskox-fur-shadow);
		}
		.horn {
			fill: var(--muskox-horn);
		}
		.eye {
			fill: var(--muskox-eye);
		}
	</style>

	<g>
		<animateTransform
			attributeName="transform"
			type="translate"
			values="0 0; 0 -2; 0 0"
			dur="0.8s"
			repeatCount="indefinite"
			keyTimes="0; 0.5; 1"
			calcMode="spline"
			keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
		/>

		<g class="fur-shadow">
			<rect x="20" y="44" width="6" height="10" rx="2" />
			<rect x="36" y="44" width="6" height="10" rx="2" />
			<animateTransform
				attributeName="transform"
				type="translate"
				values="1 0; -1 0; 1 0"
				dur="0.8s"
				repeatCount="indefinite"
			/>
		</g>

		<path
			class="fur-main"
			d="M14,28 c0-10, 8-16, 20-16 c14,0, 22,8, 22,18 c0,12, -4,18, -10,18 H18 C10,48, 14,36, 14,28 Z"
		/>

		<g>
			<path
				class="horn"
				d="M40,14 C34,14, 32,20, 32,24 L34,25 C35,22, 37,17, 40,17 C43,17, 45,22, 46,25 L48,24 C48,20, 46,14, 40,14 Z M52,24 L50,25 C51,22, 53,19, 56,18 L57,16 C52,16, 51,20, 52,24 Z"
			/>
			<path
				class="fur-shadow"
				d="M46,22 h8 a4,4 0 0,1 4,4 v4 a4,4 0 0,1 -4,4 h-8 a2,2 0 0,1 -2,-2 v-8 a2,2 0 0,1 2,-2 Z"
			/>
			<circle class="eye" cx="50" cy="27" r="1.5" />
		</g>

		<g class="fur-main">
			<rect x="16" y="46" width="6" height="10" rx="2" />
			<rect x="32" y="46" width="6" height="10" rx="2" />
			<animateTransform
				attributeName="transform"
				type="translate"
				values="-1 0; 1 0; -1 0"
				dur="0.8s"
				repeatCount="indefinite"
			/>
		</g>
	</g>
</svg>
