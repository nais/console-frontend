<script>
	import Alert from '$lib/Alert.svelte';
	import EmissionsIcon from '$lib/icons/EmissionsIcon.svelte';
</script>

<div class="iconBar">
	<span>
		<EmissionsIcon size="1.5rem" /> 1.08 T/mo
	</span>
</div>
<Alert variant="tip">
	<b>Tip:</b> You are among the top 10 contributors to carbon emissions in your organisation. Read more
	about how you can reduce your emmision.
</Alert>

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
