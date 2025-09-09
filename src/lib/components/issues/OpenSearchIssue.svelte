<script lang="ts">
	import type { IssueFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'OpenSearchIssue' }>;
	} = $props();
</script>

<div>
	OpenSearch issue: {data.message}
</div>
