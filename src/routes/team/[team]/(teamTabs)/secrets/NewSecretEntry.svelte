<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';

	export let i: number; 
	export let j: number;

</script>


<div class="entry">
	<div class="keyfield">
		<TextField size="small" htmlSize={30}  placeholder="New value" />
	</div>
	<div>
		<TextField size="small" htmlSize={30} placeholder="New secret" />
	</div>
	<Button size="small" on:click={() => {}}>Add</Button>
	
</div>

<style>
	.entry {
		display: flex;
	}
	.entry > :global(*) {
		margin: 16px 0 16px 16px; 
	}
</style>
