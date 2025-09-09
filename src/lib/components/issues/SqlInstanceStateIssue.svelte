<script lang="ts">
	import type { IssueFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<IssueFragment$data, { __typename: 'SqlInstanceStateIssue' }>;
	} = $props();
</script>

<div>
	SQL Instance State issue: {data.message}
</div>
