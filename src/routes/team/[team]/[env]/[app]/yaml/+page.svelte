<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { naisyaml } from '$lib/mock/naisyaml';
	$: app = $page.params.app;
</script>

<Card>
	<h3>nais.yaml for {app}</h3>
	<pre>
{JSON.stringify(naisyaml, null, 2)}
</pre>
</Card>
