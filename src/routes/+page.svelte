<script lang="ts">
	import Teams from './Teams.svelte';
	import Deploys from './Deploys.svelte';
	import { Alert } from '@nais/ds-svelte';
</script>

<div class="info">
	<Alert variant="info">
		This page is under construction. Future versions will include:
		<ul>
			<li>Team management</li>
			<li>Cost and billing information/analysis</li>
			<li>Application metrics, logs and insight</li>
			<li>Analysis and statistics</li>
		</ul>
	</Alert>
</div>
<div class="main">
	<Teams />
	<div class="grow">
		<Deploys />
	</div>
</div>

<style>
	.info {
		margin-bottom: 2rem;
	}
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
