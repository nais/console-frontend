<script lang="ts">
	import Card from '$lib/Card.svelte';
	import { fragment, graphql } from '$houdini';
	import type { Manifest } from '$houdini';

	export let app: Manifest;
	$: data = fragment(
		app,
		graphql(`
			fragment Manifest on App {
				manifest {
					data
				}
			}
		`)
	);

	$: yaml = $data.manifest;
</script>

<Card>
	<pre>{yaml.data}</pre>
</Card>
