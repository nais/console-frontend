<script lang="ts">
	import type { IssueFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'ValkeyIssue' }>;
	} = $props();
</script>

<div>
	Valkey Issue: {data.message}
</div>
