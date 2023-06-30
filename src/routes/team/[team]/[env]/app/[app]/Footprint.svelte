<script>
	import Alert from '$lib/Alert.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
</script>

<div class="iconBar">
	<span>
		<CostIcon size="1.5rem" /> $12 413
	</span>
	<span>
		<MemoryIcon size="1.5rem" /> 123 MB
	</span>
	<span>
		<CpuIcon size="1.5rem" /> 0,38 Cores
	</span>
</div>
<Alert variant="tip">
	<b>Tip:</b> You are using less than 50% of your CPU request, and can safely scale down resource requests
	in your application network
</Alert>
<p>
	<a href="/">Dashboard</a>
</p>

<style>
	.iconBar {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
	}
	.iconBar > span {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
