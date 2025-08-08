<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { AppIngresses } = $derived(data);
</script>

<div>
	{JSON.stringify($AppIngresses, null, 2)}
</div>
