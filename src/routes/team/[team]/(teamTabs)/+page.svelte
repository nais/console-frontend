<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import Deploys from '$lib/overview/Deploys.svelte';

	$: teamName = $page.params.team;
</script>

<div class="grid">
	<Card rows={1} columns={3}>
		<h4>Statuses</h4>
		<p>2 failing apps</p>
		<p>1 failing job</p>
		<p>1337 apss running OK</p>
	</Card>
	<Card rows={1} columns={2}>
		<h4>Vulnerabilities</h4>
		<Vulnerability severity="critical" count={69} />
		<Vulnerability severity="high" count={96} />
		<Vulnerability severity="medium" count={66} />
		<Vulnerability severity="low" count={666} />
		<Vulnerability severity="unassigned" count={6} />
	</Card>
	<Card rows={6} columns={7}>
		<h4>Deployments</h4>
		<Deploys {teamName} />
	</Card>

	<Card rows={1} columns={5}>
		<Cost app="" env="" team={teamName} />
	</Card>

	<Card rows={1} columns={5}>
		<h4>Utilization</h4>
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
