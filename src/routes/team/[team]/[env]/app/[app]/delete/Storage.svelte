<script lang="ts">
	import StorageIcon from '$lib/StorageIcon.svelte';

	export let storage: {
		type: string | null;
		name: string;
	};

	const storageTypeToName = (typ: string | null) => {
		switch (typ) {
			case 'BigQueryDataset':
				return 'BigQuery';
			case 'SqlInstance':
				return 'Postgres';
			default:
				return typ;
		}
	};
</script>

<div class="storage permanent">
	<div class="icon">
		<StorageIcon type={storage.type || ''} style="height: 2rem" />
	</div>
	<div class="name">
		<span>{storageTypeToName(storage.type)}</span>
		<strong>{storage.name}</strong>
	</div>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.icon {
		font-size: 2rem;
		width: 2rem;
		height: 2rem;
	}

	.storage {
		display: flex;
		flex-direction: row;
		border-bottom: 1px solid var(--a-border-subtle);
		align-items: center;
		gap: 0.5rem;
		padding: 0.2rem;
	}

	.storage:last-child {
		border-bottom: 0;
	}

	.name {
		display: flex;
		flex-direction: column;
		min-width: 30%;
	}

	.content {
		margin: 0.5rem;
	}
</style>
