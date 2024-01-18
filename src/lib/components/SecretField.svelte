<script lang="ts">
	import { PencilIcon, TrashIcon, FloppydiskIcon } from '@nais/ds-svelte-community/icons';
	import { TextField, Button } from '@nais/ds-svelte-community';

	let show = false;
	export let key: string;
	export let value: string;
	export let i: number, j: number, k: number;

	export let update:
		| {
		env: string;
		secrets: {
			name: string;
			id: string;
			data: {
				key: string;
				value: string;
			}[];
		}[];
	}[]
		| undefined;

	function toggle() {
		show = !show;
	}

	function updateKv() {
		console.log('secretfilec', update, i, j, k);
		if (update) {
			update[i].secrets[j].data[k] = { key: key, value: value };
			show = !show;
		}
	}

	let deleteKv = () => {
		if (update) {
			update[i].secrets[j].data.splice(k, 1);
			deleted = true;
			console.log('REMOVE', update);
			console.log('REMOVED', deleted);
		}
	};

	$: deleted = false;
	let entryClass = `entry ${deleted ? 'deleted' : 'foo'}`;
</script>

{#if show}
	<div class={entryClass}>
		<TextField hideLabel size="small" htmlSize={30} bind:value={key} />
		<TextField hideLabel size="small" htmlSize={30} bind:value />
		<div class="buttons">
			<Button size="small" on:click={updateKv}>
				<FloppydiskIcon />
			</Button>
			<Button size="small" on:click={deleteKv} variant="danger">
				<TrashIcon />
			</Button>
		</div>
	</div>
{:else}
	<div class={entryClass}>
		<TextField
			hideLabel
			size="small"
			htmlSize={30}
			bind:value={key}
			disabled={true}
			readonly={true}
		/>

		<TextField hideLabel size="small" htmlSize={30} bind:value disabled={true} readonly={true} />
		<div class="buttons">
			<Button size="small" on:click={toggle}>
				<PencilIcon />
			</Button>
		</div>
	</div>
{/if}

<style>
	.entry {
		display: flex;
	}
	.entry > :global(*) {
		margin: 16px 0 0 16px;
	}
	.buttons {
		margin-left: 8px;
	}
	.deleted {
		border: red 1px solid;
	}
</style>
