<script lang="ts">
	import { page } from '$app/state';
	import { fragment, graphql, type ServiceAccountAuthenticationFragment } from '$houdini';
	import SearchComponent from '$lib/domain/search/Search.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Button, Detail, Heading, Modal, Tabs, Tooltip } from '@nais/ds-svelte-community';
	import {
		BranchingIcon,
		BriefcaseClockIcon,
		ClockDashedIcon,
		EnvelopeOpenIcon,
		PackageIcon,
		TokenIcon
	} from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

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
	let searchString = $state('');

	$effect(() => {
		if (searchString) {
			const timeout = setTimeout(() => {
				searchQuery.fetch({ variables: { query: searchString, team: page.params.team ?? '' } });
			}, 300);

			return () => clearTimeout(timeout);
		}
	});

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

	const totalMethods = $derived($data.workloadBindings.edges.length + $data.tokens.edges.length);
</script>

<section>
	{#if totalMethods > 0}
		<div class="search">
			{#if viewerIsMember}
				<Button size="small" variant="secondary" onclick={() => (showAddModal = true)}
					>Add new</Button
				>
			{/if}
		</div>

		<List title="{totalMethods} authentication method{totalMethods !== 1 ? 's' : ''}">
			{#each $data.workloadBindings.edges as { node: binding } (binding.id)}
				<ListItem>
					<IconLabel
						as="h4"
						size="large"
						label={binding.workload?.name ?? binding.workloadName}
						icon={BranchingIcon}
						tag={{
							label: binding.workload?.teamEnvironment.environment.name ?? binding.environment,
							variant: envTagVariant(
								binding.workload?.teamEnvironment.environment.name ?? binding.environment
							)
						}}
						description="Workload binding · {binding.workload?.__typename === 'Application'
							? 'Application'
							: 'Job'}{binding.isBroken ? ' · Broken' : ''}"
					/>

					<div class="right">
						{#if binding.lastUsedAt}
							<Tooltip content="Last used - {format(binding.lastUsedAt, 'PPPP', { locale: enGB })}">
								<Detail>
									Last used <Time time={binding.lastUsedAt} distance={true} />
								</Detail>
							</Tooltip>
						{:else}
							<Detail>Never used</Detail>
						{/if}
						<Tooltip content="Created - {format(binding.createdAt, 'PPPP', { locale: enGB })}">
							<Detail>
								Created <Time time={binding.createdAt} distance={true} />
							</Detail>
						</Tooltip>
					</div>
				</ListItem>
			{/each}

			{#each $data.tokens.edges as { node: token } (token.id)}
				<ListItem>
					<IconLabel
						as="h4"
						size="large"
						label={token.name}
						icon={TokenIcon}
						description="API Token · {token.description}"
					/>

					<div class="right">
						{#if token.lastUsedAt}
							<Tooltip content="Last used - {format(token.lastUsedAt, 'PPPP', { locale: enGB })}">
								<Detail>
									Last used <Time time={token.lastUsedAt} distance={true} />
								</Detail>
							</Tooltip>
						{:else}
							<Detail>Never used</Detail>
						{/if}
						{#if token.expiresAt}
							<Tooltip content="Expires - {format(token.expiresAt, 'PPPP', { locale: enGB })}">
								<Detail>
									Expires <Time time={token.expiresAt} distance={true} />
								</Detail>
							</Tooltip>
						{/if}
					</div>
				</ListItem>
			{/each}
		</List>
	{:else}
		<Heading size="small" as="h3">Authentication methods</Heading>
		<p>No available authentication methods.</p>
		{#if viewerIsMember}
			<Button size="small" variant="secondary" onclick={() => (showAddModal = true)}>Add new</Button
			>
		{/if}
	{/if}
</section>

<Modal width="medium" bind:open={showAddModal} class="search-modal">
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
			<SearchComponent
				close={() => (showAddModal = false)}
				placeholder="Search for workloads..."
				bind:query={searchString}
				loading={$searchQuery.fetching}
				suggestions={false}
				helpers={false}
				results={searchString && $searchQuery.data
					? $searchQuery.data.search.nodes
							.filter(
								(
									n
								): n is typeof n & {
									__typename: 'Application' | 'Job';
									id: string;
									name: string;
									teamEnvironment: { environment: { name: string } };
								} => n.__typename === 'Application' || n.__typename === 'Job'
							)
							.map((node) => ({
								icon: node.__typename === 'Application' ? PackageIcon : BriefcaseClockIcon,
								label: node.name,
								description: node.__typename === 'Application' ? 'Application' : 'Job',
								tag: {
									label: node.teamEnvironment.environment.name,
									variant: envTagVariant(node.teamEnvironment.environment.name)
								},
								type: 'button' as const,
								button: {
									onclick: () => {
										addWorkloadBinding({
											name: node.name,
											environment: node.teamEnvironment.environment.name
										});
									},
									label: 'Add',
									variant: 'tertiary' as const
								}
							}))
					: undefined}
			/>
		</Tabs.Panel>

		<Tabs.Panel value="api_token">Create API token</Tabs.Panel>
	</Tabs>
</Modal>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	.search {
		display: flex;
		justify-content: flex-end;
	}

	:global(.search-modal) {
		height: 70vh;
		max-height: 600px;
	}

	@media (max-width: 767px) {
		.right {
			align-items: flex-end;
		}
	}
</style>
