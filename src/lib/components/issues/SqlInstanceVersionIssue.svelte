<script lang="ts">
	import type { IssueFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'SqlInstanceVersionIssue' }>;
	} = $props();
</script>

<div>
	SQL Instance Version Issue: {data.message}
</div>
