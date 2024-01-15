<script lang="ts">
	import { PencilIcon, TrashIcon, FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	import { TextField, Button } from '@nais/ds-svelte-community';

	let show = false;
	export let key: string;
	export let value: string;
	function toggle() {
		show = !show;
	}
</script>

{#if show}
	<div class="entry">
		<div class="keyfield">
			<TextField hideLabel size="small" htmlSize={14} bind:value={key} />
		</div>
		<div>
			<TextField hideLabel size="small" htmlSize={14} bind:value />
		</div>
		<Button size="small" on:click={toggle}><FloppydiskIcon /></Button>
		<Button size="small"><TrashIcon /></Button>
	</div>
{:else}
	<div class="entry">
		<div class="keyfield">
            <TextField hideLabel size="small" htmlSize={14} bind:value={key} disabled={true} readonly={true}/>
		
            
		</div>
		<TextField hideLabel size="small" htmlSize={14} bind:value={value} disabled={true} readonly={true}/>
		
    
		<Button size="small" on:click={toggle}><PencilIcon /></Button>
		<Button size="small"><TrashIcon /></Button>
	</div>
{/if}

<style>
	button {
		background: transparent;
		border: none;
	}
    .entry {display: flex;}
</style>
