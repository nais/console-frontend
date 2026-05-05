<script lang="ts">
	import { page } from '$app/state';
	import { fragment, graphql, type ServiceAccountAuthenticationFragment } from '$houdini';
	import { Button, Heading, Modal, Search, Tabs } from '@nais/ds-svelte-community';
	import { ClockDashedIcon, EnvelopeOpenIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		serviceAccount: ServiceAccountAuthenticationFragment;
		viewerIsMember?: boolean;
	}

	let { serviceAccount, viewerIsMember = false }: Props = $props();

	const data = $derived(
		fragment(
			serviceAccount,
			graphql(`
				fragment ServiceAccountAuthenticationFragment on ServiceAccount {
					id
					workloadBindings(first: 20) {
						edges {
							node {
								id
								workload {
									__typename
									name
									teamEnvironment {
										environment {
											name
										}
									}
									team {
										slug
									}
								}
								environment
								teamSlug
								workloadName
								isBroken
								createdAt
								lastUsedAt
							}
						}
					}

					tokens {
						edges {
							node {
								id
								description
								name
								createdAt
								lastUsedAt
								expiresAt
							}
						}
					}
				}
			`)
		)
	);

	const searchQuery = $derived(
		graphql(`
			query TeamSAAuthorizationSearch($query: String!, $team: Slug!) {
				search(filter: { query: $query, types: [APPLICATION, JOB], teams: [$team] }) {
					nodes {
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
		`)
	);

	let showAddModal = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let searchString = $state('');

	const search = (e: Event) => {
		e.preventDefault();
		searchString = (e.target as HTMLInputElement | null)?.value ?? '';

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(() => {
			searchQuery.fetch({ variables: { query: searchString, team: page.params.team ?? '' } });
		}, 300);
	};

	const addWorkloadBindingMutation = graphql(`
		mutation AddWorkloadBindingTeamSA($input: AddWorkloadToServiceAccountInput!) {
			addWorkloadToServiceAccount(input: $input) {
				serviceAccount {
					updatedAt
				}
			}
		}
	`);

	const addWorkloadBinding = ({ name, environment }: { name: string; environment: string }) => {
		addWorkloadBindingMutation.mutate({
			input: {
				serviceAccountID: $data.id,
				workloadName: name,
				environment: environment,
				teamSlug: page.params.team ?? ''
			}
		});
	};
</script>

<section>
	<Heading size="small" as="h3">Authentication methods</Heading>

	{#if viewerIsMember}
		<Button size="small" variant="secondary" onclick={() => (showAddModal = true)}>Add new</Button>
	{/if}
	{#if $data.workloadBindings.edges.length > 0 || $data.tokens.edges.length > 0}
		<p>Service account has the following authentication methods:</p>
		<ul>
			{#each $data.workloadBindings.edges as { node: binding } (binding.id)}
				<li>
					<strong>Workload binding</strong> to
					<em>{binding.workload?.__typename === 'Application' ? 'application' : 'job'}</em>
					<em>{binding.workload?.name}</em> in environment
					<em>{binding.workload?.teamEnvironment.environment.name}</em> of team
					<em>{binding.workload?.team.slug}</em>.
					{#if binding.isBroken}
						<span style="color: red;">(broken)</span>
					{/if}
				</li>
			{/each}
			{#each $data.tokens.edges as { node: token } (token.id)}
				<li>
					<strong>Token</strong> named <em>{token.name}</em> with description
					<em>{token.description}</em>.
				</li>
			{/each}
		</ul>
	{:else}
		<p>No available authentication methods.</p>
	{/if}
</section>

<Modal bind:open={showAddModal} header="Add authentication method">
	<Tabs value="workload_binding">
		<Tabs.List>
			<Tabs.Tab value="workload_binding">
				{#snippet icon()}<ClockDashedIcon aria-label="Workload binding" />{/snippet}
				Workload binding
			</Tabs.Tab>
			<Tabs.Tab value="api_token">
				{#snippet icon()}<EnvelopeOpenIcon aria-label="API Token" />{/snippet}
				API Token
			</Tabs.Tab>
		</Tabs.List>

		<Tabs.Panel value="workload_binding">
			<Search
				label="Search for workload"
				placeholder="Search workloads..."
				bind:value={searchString}
				onchange={search}
			/>

			{#if $searchQuery.data}
				<ul>
					{#each $searchQuery.data.search.nodes as node (node.id)}
						<Button
							onclick={() => {
								if (node.__typename === 'Application' || node.__typename === 'Job') {
									addWorkloadBinding({
										name: node.name,
										environment: node.teamEnvironment.environment.name
									});
								}
							}}
						>
							<strong>{node.name}</strong> <br />{node.teamEnvironment.environment.name}
						</Button><br />
					{/each}
				</ul>
			{:else if searchString.length > 0}
				<p>Searching...</p>
			{/if}
		</Tabs.Panel>

		<Tabs.Panel value="api_token">Create API token</Tabs.Panel>
	</Tabs>
</Modal>
