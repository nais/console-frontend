<script lang="ts">
	import Teams from './Teams.svelte';
	import Deploys from './Deploys.svelte';
</script>

<div class="main">
	<Teams />
	<div class="grow">
		<Deploys />
	</div>
</div>

<style>
	.main {
		width: 100%;
		height: 100%;
		display: flex;
		gap: 1rem;
	}
	.grow {
		flex-grow: 1;
		margin: 0;
	}
</style>
