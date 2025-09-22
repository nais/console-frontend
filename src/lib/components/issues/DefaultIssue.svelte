<script lang="ts">
	import type { IssueFragment$data } from '$houdini';
	import { Heading } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'DeprecatedIngressIssue' }>;
	} = $props();
</script>

<div>
	<Heading level="2" size="small">{data.__typename}</Heading>
	Issue in environment {data.teamEnvironment.environment.name}: {data.message}
</div>
