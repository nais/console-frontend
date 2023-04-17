<script>
	import { appSpec } from '$lib/mock/appSpec';
	import Globe from '$lib/icons/Globe.svelte';
	import Card from '$lib/Card.svelte';
</script>

<Card>
	<h1>ingresses</h1>
	<p>
		{#each appSpec.ingress as ingress}
			<div style="display: flex; align-items: center; flex-direction: row; gap: 0.5rem;">
				<a href="/">{ingress}</a><Globe />
			</div>
		{/each}
	</p>
	<p>We can include information about RPS per ingress, where this ingress is available from</p>
</Card>
