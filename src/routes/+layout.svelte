<script>
	import Header from './Header.svelte';
	import '../styles/reset.css';
	import '@navikt/ds-css/dist/index.css';
	import '../styles/vars_light.css';
	//import '../styles/vars_dark.css';
	import '../styles/app.css';
	import '$lib/font.css';
</script>

<Header />
<div class="container">
	<slot />
</div>

<style>
	.container {
		margin: auto;
		display: flex;
		flex-direction: column;
		max-width: 1400px;
		padding: 0 2rem;
		height: 100%;
	}
</style>
