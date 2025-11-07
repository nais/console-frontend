<script lang="ts">
	import { favorites } from '$lib/stores/favorites.svelte';
	import { Button, Tooltip } from '@nais/ds-svelte-community';
	import { DragVerticalIcon, StarFillIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import ListItem from './ListItem.svelte';

	const {
		path
	}: {
		path: string;
	} = $props();

	function removeFavorite() {
		favorites.removeFavorite(path);
	}

	function capitalize(str: string): string {
		if (!str) return '';
		return str[0].toUpperCase() + str.slice(1);
	}

	const label = (type: string) => {
		switch (type) {
			case 'job':
				return {
					pageName: 'Jobs',
					plural: 'jobs'
				};
			case 'app':
				return {
					pageName: 'Applications',
					plural: 'applications'
				};
			case 'secret':
				return {
					pageName: 'Secrets',
					plural: 'secrets'
				};
			case 'postgres':
				return {
					pageName: 'Postgres Instances',
					plural: 'postgres'
				};
			case 'bucket':
				return {
					pageName: 'Buckets',
					plural: 'buckets'
				};
			case 'valkey':
				return {
					pageName: 'Valkey Instances',
					plural: 'valkey'
				};
			case 'opensearch':
				return {
					pageName: 'OpenSearch Instances',
					plural: 'opensearch'
				};
			case 'kafka':
				return {
					pageName: 'Kafka Topics',
					plural: 'kafka'
				};
			case 'bigquery':
				return {
					pageName: 'BigQuery Datasets',
					plural: 'bigquery'
				};
			case 'deploy':
			case 'deploys':
				return {
					pageName: 'Deployments'
				};
			case 'activity-log':
				return {
					pageName: 'Activity Log'
				};
			case 'confirm_delete':
				return {
					pageName: 'Confirm Team Deletion'
				};
			case 'vulnerability-report':
				return {
					pageName: 'Vulnerability Report'
				};
			default:
				return {
					pageName: type
						? type
								.split(' ')
								.map((word) => word[0].toUpperCase() + word.slice(1))
								.join(' ')
						: ''
				};
		}
	};

	function pathToFavoriteLabel(path: string): string {
		const parts = path.split('/').filter(Boolean);

		if (parts.length < 2 || parts[0] !== 'team') {
			return path;
		}

		const team = parts[1];

		// Case: /team/{team} only
		if (parts.length === 2) {
			return team;
		}

		// Case: /team/{team}/{something} (kan være env eller annen underside)
		if (parts.length === 3) {
			const secondPart = parts[2];
			// Hvis denne matcher et kjent miljø, vis som team · env
			// Her kan du evt ha liste over miljøer, men for enkelhet viser vi alltid som env
			return `${team} · ${capitalize(secondPart)}`;
		}

		// Lengre path med miljø, type osv.
		const env = parts[2];
		const type = parts[3];
		const resource = parts[4] ?? null;
		const subpage = parts[5] ?? null;

		if (type === 'settings' && resource === 'confirm_delete') {
			return `${team} · Confirm Team Deletion`;
		}

		const typeInfo = label(type);

		const labelParts = [team, env];

		if (resource) {
			labelParts.push(typeInfo.pageName);
			labelParts.push(resource);
		} else {
			labelParts.push(typeInfo.pageName);
		}

		if (subpage) {
			// Special handling for insights subpage
			if (subpage === 'insights') {
				labelParts.push('Insights');
			} else {
				const subpageInfo = label(subpage);
				if (subpageInfo.pageName) {
					labelParts.push(subpageInfo.pageName);
				} else {
					labelParts.push(capitalize(subpage));
				}
			}
		}

		return labelParts.join(' · ');
	}
</script>

<ListItem>
	<IconLabel label={pathToFavoriteLabel(path)} icon={StarFillIcon} size="medium" href={path} />
	<div class="right">
		<Tooltip placement="bottom" content="Remove from favorites">
			<Button icon={TrashIcon} onclick={removeFavorite} variant="tertiary-neutral" />
		</Tooltip>
	</div>
	<div class="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
		<DragVerticalIcon />
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-1);
	}

	.drag-handle {
		cursor: grab;
		user-select: none;
		margin-right: var(--ax-space-2);
		display: flex;
		align-items: center;
		font-size: 1.2rem;
	}
</style>
