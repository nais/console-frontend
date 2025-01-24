<script lang="ts">
	import { ArrowLeftIcon } from '@nais/ds-svelte-community/icons';
	import PersistenceIcon from './PersistenceIcon.svelte';

	interface Props {
		type: string | null;
		name: string;
		environment: string;
		path: string;
		text: string;
	}

	let { type, name, environment, path, text }: Props = $props();
</script>

<div class="resource-header-wrapper">
	<div class="header">
		<span>
			<a href={path}><ArrowLeftIcon /> {text}</a>
		</span>
		<div class="icon-and-name-wrapper">
			<div class="icon">
				{#if type}
					<PersistenceIcon size={'32px'} {type} />
				{/if}
			</div>
			<div>
				<h3>{name}</h3>
				<span class="environment">
					{environment}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.resource-header-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 1rem;
		.header {
			display: flex;
			flex-direction: column;
			align-items: left;
		}
		.icon-and-name-wrapper {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			.icon {
				display: flex;
				flex-direction: row;
			}
			h3 {
				margin: 0;
			}
			.environment {
				color: var(--a-text-subtle);
				font-size: 1rem;
			}
		}
	}
</style>
