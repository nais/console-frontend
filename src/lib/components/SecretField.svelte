<script lang="ts">
	import { PencilIcon, TrashIcon, FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	import { TextField, Button } from '@nais/ds-svelte-community';

	let show = false;
	export let key: string;
	export let value: string;
	function toggle() {
		show = !show;
	}

	function updateKey(e) {
		key = e.target.value;
	}

	function updateValue(e) {
		value = e.target.value;
	}

	function deleteKv() {

	}
</script>

{#if show}
	<div class="entry">
		<TextField hideLabel size="small" htmlSize={14} bind:value={key}
							 on:change={updateKey}/>
		<TextField hideLabel size="small" htmlSize={14} bind:value
							 on:change={updateValue}/>
		<Button size="small" on:click={toggle}><FloppydiskIcon /></Button>
		<Button size="small" on:click={deleteKv}><TrashIcon /></Button>
	</div>
{:else}
	<div class="entry">
		<TextField
			hideLabel
			size="small"
			htmlSize={14}
			bind:value={key}
			disabled={true}
			readonly={true}
		/>

		<TextField hideLabel size="small" htmlSize={14} bind:value disabled={true} readonly={true} />

		<Button size="small" on:click={toggle}><PencilIcon /></Button>
		<Button size="small"><TrashIcon /></Button>
	</div>
{/if}

<style>
	.entry {
		display: flex;
  }
</style>
