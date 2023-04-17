<script>
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { appSpec } from '$lib/mock/appSpec';
</script>

<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
	<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
	{appSpec.instances.length} running
</div>
<p>
	Min. 2 / Max 8 <a href="/">Adjust</a>
</p>
