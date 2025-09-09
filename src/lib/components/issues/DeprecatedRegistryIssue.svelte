<script lang="ts">
	import type { IssueFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'DeprecatedRegistryIssue' }>;
	} = $props();
</script>

<div>
	Deprecated Registry Issue: {data.message}
</div>
