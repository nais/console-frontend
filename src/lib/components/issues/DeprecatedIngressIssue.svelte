<script lang="ts">
	import type { IssueFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'DeprecatedIngressIssue' }>;
	} = $props();
</script>

<div>
	Deprecated Ingress in application {data.application.name}. Affected ingresses:
	<ul>
		{#each data.ingresses as ingress (ingress)}
			<li>{ingress}</li>
		{/each}
	</ul>
</div>
