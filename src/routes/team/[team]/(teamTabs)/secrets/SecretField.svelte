<script lang="ts">
	import { PencilIcon, TrashIcon, RecycleIcon } from '@nais/ds-svelte-community/icons';
	import { TextField, Button } from '@nais/ds-svelte-community';

	let show = false;
	export let key: string;
	export let value: string;
	export let i: number, j: number, k: number;

	export let update:
		| {
				env: {
					name: string;
				};
				secrets: {
					name: string;
					id: string;
					data: {
						key: string;
						value: string;
						added?: boolean;
						deleted?: boolean;
					}[];
				}[];
		  }[]
		| undefined;

	function toggle() {
		show = !show;
	}

	let deleteKv = () => {
		if (update) {
			deleted = true;
			update[i].secrets[j].data[k] = { ...update[i].secrets[j].data[k], deleted }
		}
	};

	let unDeleteKv = () => {
		if (update) {
			deleted = false
			update[i].secrets[j].data[k] = { ...update[i].secrets[j].data[k], deleted }
		}
	}

	let deleted = false;
	let added: boolean | undefined = false;
	if (update) {
		added = update[i].secrets[j].data[k].added;
	}
</script>


{#if show}
	<div class="entry" class:deleted class:added>
		<TextField hideLabel size="small" htmlSize={30} bind:value={key} />
		<TextField hideLabel size="small" htmlSize={30} bind:value />
		<div class="buttons">
			<Button size="small" on:click={deleted ? unDeleteKv : deleteKv} variant="danger">
				{#if deleted}<RecycleIcon /> {:else} <TrashIcon/> {/if}
			</Button>
		</div>
	</div>
{:else}
	<div class="entry" class:deleted class:added>
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
		--ac-textfield-border: var(--a-border-danger);
		--ac-textfield-bg: var(--a-surface-danger-subtle);
	}
	.added {
		--ac-textfield-border: var(--a-surface-success-moderate);
		--ac-textfield-bg: var(--a-surface-success-subtle);
	}
</style>
