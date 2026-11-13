<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';

	interface Props {
		persistence: {
			__typename: string | null;
			name: string;
		};
		children?: import('svelte').Snippet;
	}

	let { persistence, children }: Props = $props();

	const persistenceTypeToName = (type: string | null) => {
		switch (type) {
			case 'BigQueryDataset':
				return 'BigQuery';
			case 'SqlInstance':
				return 'Cloud SQL';
			case 'Valkey':
				return 'Valkey';
			default:
				return type;
		}
	};
</script>

<div class="persistence">
	<div class="icon">
		<Icon icon={persistence.__typename} />
	</div>
	<div class="name">
		<span>{persistenceTypeToName(persistence.__typename)}</span>
		<strong>{persistence.name}</strong>
	</div>
	<div class="content">
		{@render children?.()}
	</div>
</div>

<style>
	.icon {
		font-size: var(--sh-font-size-title);
		width: var(--nais-space-32);
		height: var(--nais-space-32);
	}

	.persistence {
		display: flex;
		width: 850px;
		flex-direction: row;
		border-bottom: 1px solid var(--border);
		align-items: center;
		gap: var(--nais-space-8);
		padding: var(--nais-space-4);
	}

	.persistence:last-child {
		border-bottom: 0;
	}

	.name {
		display: flex;
		flex-direction: column;
		min-width: 15%;
	}

	.content {
		margin: var(--nais-space-8);
		max-width: 80ch;
	}
</style>
