<script>
	import { Button, TextField } from '@nais/ds-svelte-community';
</script>

<div class="entry">
	<div class="keyfield">
		<TextField hideLabel size="small" htmlSize={14} placeholder="New value" />
	</div>
	<div>
		<TextField hideLabel size="small" htmlSize={14} placeholder="New secret" />
	</div>
	<Button size="small">Add</Button>
</div>

<style>
	.entry {
		display: flex;
	}
</style>
