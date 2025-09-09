<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import IssueLabel from './IssueLabel.svelte';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'DeprecatedIngressIssue' }>;
	} = $props();
</script>

<div class="item">
	<div>
		<IssueLabel
			environmentName={data.teamEnvironment.environment.name}
			teamSlug={data.teamEnvironment.team.slug}
			severity={data.severity}
			workloadName={data.application.name}
			workloadType="app"
		/>
	</div>

	<div>
		Application {data.application.name} uses deprecated ingress{data.ingresses.length > 1
			? 'es'
			: ''}:
		<ul>
			{#each data.ingresses as ingress (ingress)}
				<li><code>{ingress}</code></li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 300px auto;
		gap: 1rem;
	}

	code {
		font-size: 0.9rem;
	}
	ul {
		margin: 0;
		padding: 0.2rem 0 0rem 1rem;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}
</style>
