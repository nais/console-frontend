<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import {
		Alert,
		BodyLong,
		Button,
		Detail,
		ErrorMessage,
		Tag,
		TextField
	} from '@nais/ds-svelte-community';
	import { BriefcaseClockIcon, CheckmarkIcon, PackageIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { ServiceAccountDetail } = $derived(data);

	const serviceAccount = $derived($ServiceAccountDetail.data?.serviceAccount);

	const existingBindings = $derived(
		new Set(
			serviceAccount?.workloadBindings.edges.map(
				({ node }) => `${node.workloadName}:${node.environment}`
			) ?? []
		)
	);

	const searchQuery = $derived(
		graphql(`
			query AddBindingWorkloadSearch($query: String!, $teams: [Slug!]!) {
				search(filter: { query: $query, types: [APPLICATION, JOB], teams: $teams }) {
					edges {
						node {
							__typename
							... on Workload {
								id
								name
								teamEnvironment {
									environment {
										name
									}
								}
							}
						}
					}
				}
			}
		`)
	);

	let searchString = $state('');
	let addedIds: Set<string> = $state(new Set());
	let errorMessage: string | undefined = $state();

	$effect(() => {
		if (searchString) {
			const timeout = setTimeout(() => {
				searchQuery.fetch({ variables: { query: searchString, teams: [page.params.team ?? ''] } });
			}, 300);

			return () => clearTimeout(timeout);
		}
	});

	const results = $derived(
		searchString && $searchQuery.data
			? $searchQuery.data.search.edges
					.map(({ node }) => node)
					.filter(
						(
							n
						): n is typeof n & {
							__typename: 'Application' | 'Job';
							id: string;
							name: string;
							teamEnvironment: { environment: { name: string } };
						} =>
							(n.__typename === 'Application' || n.__typename === 'Job') &&
							!n.teamEnvironment.environment.name.endsWith('-fss')
					)
			: []
	);

	function isAlreadyBound(node: {
		id: string;
		name: string;
		teamEnvironment: { environment: { name: string } };
	}) {
		return (
			addedIds.has(node.id) ||
			existingBindings.has(`${node.name}:${node.teamEnvironment.environment.name}`)
		);
	}
</script>

<div class="page">
	{#if errorMessage}
		<ErrorMessage>{errorMessage}</ErrorMessage>
	{/if}

	{#if !serviceAccount}
		<Alert variant="warning">Service account not found.</Alert>
	{:else}
		{#if !isPossiblyInModal()}
			<Button
				as="a"
				size="small"
				variant="secondary"
				href={resolve('/team/[team]/settings/service_accounts/[serviceAccountID]', {
					team: page.params.team!,
					serviceAccountID: page.params.serviceAccountID!
				})}
			>
				Back to service account
			</Button>
		{/if}

		<BodyLong>
			Workload bindings allow Nais Workloads to authenticate as this service account.
		</BodyLong>

		<TextField
			size="small"
			label="Search for workloads"
			placeholder="Search by name..."
			bind:value={searchString}
			autocomplete="off"
		/>

		<GraphErrors errors={$searchQuery.errors} />

		{#if $searchQuery.fetching}
			<Detail>Searching...</Detail>
		{:else if results.length > 0}
			<ul class="results">
				{#each results as node (node.id)}
					<li class="result">
						<div class="result-info">
							<div class="result-label">
								{#if node.__typename === 'Application'}
									<PackageIcon />
								{:else}
									<BriefcaseClockIcon />
								{/if}
								<span>{node.name}</span>
								<Tag size="xsmall" variant={envTagVariant(node.teamEnvironment.environment.name)}>
									{node.teamEnvironment.environment.name}
								</Tag>
							</div>
							<Detail>{node.__typename === 'Application' ? 'Application' : 'Job'}</Detail>
						</div>
						{#if isAlreadyBound(node)}
							<Button size="small" variant="tertiary" disabled>
								{#snippet icon()}<CheckmarkIcon />{/snippet}
								Added
							</Button>
						{:else}
							<form
								method="POST"
								use:enhance={() => {
									errorMessage = undefined;
									return async ({ result }) => {
										if (result.type === 'failure') {
											errorMessage = (result.data as { error?: string })?.error ?? 'Unknown error';
										} else if (result.type === 'success') {
											addedIds = new Set([...addedIds, node.id]);
										}
									};
								}}
							>
								<input type="hidden" name="workloadName" value={node.name} />
								<input
									type="hidden"
									name="environment"
									value={node.teamEnvironment.environment.name}
								/>
								<Button type="submit" size="small" variant="tertiary">Add</Button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		{:else if searchString}
			<Detail>No results matching "{searchString}"</Detail>
		{/if}
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		max-width: 600px;
	}

	.results {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--ax-space-8) var(--ax-space-12);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
	}

	.result-info {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	.result-label {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}
</style>
