<script lang="ts">
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import DeploymentListItem from '$lib/components/list/DeploymentListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import { format } from 'date-fns';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { AppDeploys } = $derived(data);

	let after: string = $derived($AppDeploys.variables?.after ?? '');
	let before: string = $derived($AppDeploys.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data}
	<div class="wrapper">
		<div>
			<BodyLong spacing>
				{#if $AppDeploys.data.team.environment.application.deployments.pageInfo.totalCount == 0}
					<strong
						>No deployments of <strong>{$AppDeploys.data.team.environment.application.name}</strong>
						in <Tag
							size="small"
							variant={envTagVariant(
								$AppDeploys.data.team.environment.application.teamEnvironment.environment.name
							)}
							>{$AppDeploys.data.team.environment.application.teamEnvironment.environment.name}</Tag
						> found.</strong
					>
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{:else}
					Overview of deployments of <strong
						>{$AppDeploys.data.team.environment.application.name}</strong
					>
					in <Tag
						size="small"
						variant={envTagVariant(
							$AppDeploys.data.team.environment.application.teamEnvironment.environment.name
						)}>{$AppDeploys.data.team.environment.application.teamEnvironment.environment.name}</Tag
					>.
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{/if}
			</BodyLong>
			<List
				title="{$AppDeploys.data.team.environment.application.deployments.pageInfo
					.totalCount} deployment{$AppDeploys.data.team.environment.application.deployments.pageInfo
					.totalCount !== 1
					? 's'
					: ''} - showing {$AppDeploys.data.team.environment.application.deployments.pageInfo
					.pageEnd -
					$AppDeploys.data.team.environment.application.deployments.pageInfo.pageStart +
					1} from {format(
					$AppDeploys.data.team.environment.application.deployments.nodes.at(0)?.createdAt ?? '',
					'dd/MM/yyyy'
				)} to {format(
					$AppDeploys.data.team.environment.application.deployments.nodes.at(-1)?.createdAt ?? '',
					'dd/MM/yyyy'
				)}"
			>
				{#each $AppDeploys.data.team.environment.application.deployments.nodes as deployment (deployment.id)}
					<div><DeploymentListItem {deployment} /></div>
				{/each}
			</List>
			<Pagination
				page={$AppDeploys.data.team.environment.application.deployments.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({
							after: '',
							before:
								$AppDeploys.data?.team.environment.application.deployments.pageInfo.startCursor ??
								''
						});
					},
					loadNextPage: () => {
						changeQuery({
							before: '',
							after:
								$AppDeploys.data?.team.environment.application.deployments.pageInfo.endCursor ?? ''
						});
					}
				}}
			/>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
