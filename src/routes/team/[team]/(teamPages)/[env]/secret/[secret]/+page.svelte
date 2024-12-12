<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Button,
		Heading,
		HelpText,
		Loader,
		Modal,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';

	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { DocPencilIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import AddKeyValue from './AddKeyValue.svelte';
	import Manifest from './Manifest.svelte';
	import Metadata from './Metadata.svelte';
	import Textarea from './Textarea.svelte';
	import Workloads from './Workloads.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Secret } = $derived(data);
	let secret = $derived($Secret.data?.team.environment.secret);

	let secretName = $derived($page.params.secret);
	let env = $derived($page.params.env);
	let team = $derived($page.params.team);

	let deleteSecretOpen = $state(false);
	let deleteValueOpen = $state(false);
	let editValueOpen = $state(false);

	let keyToDelete = $state('');
	let keyToEdit = $state('');
	let valueToEdit = $state('');

	const updateSecretValue = graphql(`
		mutation updateSecretValue(
			$name: String!
			$team: Slug!
			$env: String!
			$value: SecretValueInput!
		) {
			updateSecretValue(input: { environment: $env, name: $name, team: $team, value: $value }) {
				secret {
					id
					values {
						name
						value
					}
					lastModifiedBy {
						name
						email
					}
					lastModifiedAt
				}
			}
		}
	`);

	const editValueForKey = async () => {
		if (keyToEdit == '') {
			return;
		}
		await updateSecretValue.mutate({
			name: secretName,
			team: team,
			env: env,
			value: {
				name: keyToEdit,
				value: valueToEdit
			}
		});

		if ($updateSecretValue.errors) {
			return;
		}

		editValueOpen = false;
		keyToEdit = '';
	};

	const removeSecretValue = graphql(`
		mutation removeSecretValue($name: String!, $team: Slug!, $env: String!, $valueName: String!) {
			removeSecretValue(
				input: { environment: $env, secretName: $name, team: $team, valueName: $valueName }
			) {
				secret {
					id
					values {
						name
						value
					}
					lastModifiedBy {
						name
						email
					}
					lastModifiedAt
				}
			}
		}
	`);

	const deleteValueFromSecret = async () => {
		if (keyToDelete == '') {
			return;
		}
		await removeSecretValue.mutate({
			name: secretName,
			team: team,
			env: env,
			valueName: keyToDelete
		});

		if ($removeSecretValue.errors) {
			return;
		}

		deleteValueOpen = false;
		keyToDelete = '';
	};

	const deleteMutation = graphql(`
		mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
			deleteSecret(input: { name: $name, team: $team, environment: $env }) {
				secretDeleted
			}
		}
	`);

	const deleteSecret = async () => {
		await deleteMutation.mutate({
			name: secretName,
			team: team,
			env: env
		});

		if ($deleteMutation.errors) {
			return;
		}

		await goto('/team/' + team + '/secrets');
	};

	const openDeleteModal = () => {
		deleteSecretOpen = true;
	};

	const openDeleteValueModal = (key: string) => {
		keyToDelete = key;
		deleteValueOpen = true;
	};

	const openEditValueModal = (key: string, value: string) => {
		keyToEdit = key;
		valueToEdit = value;
		editValueOpen = true;
	};

	const cancelEditValue = () => {
		editValueOpen = false;
		keyToEdit = '';
		valueToEdit = '';
	};
</script>

<GraphErrors errors={$Secret.errors} />

{#if $Secret.fetching}
	<Loader />
{:else if secret}
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={deleteSecretOpen}
		onconfirm={deleteSecret}
	>
		{#snippet header()}
			<Heading>Delete secret</Heading>
		{/snippet}
		<p>
			This will permanently delete the secret named <b>{secret.name}</b> from <b>{env}</b>.
		</p>
		{#if secret.workloads.nodes.length > 0}
			<p>These workloads still reference the secret:</p>
			<ul>
				{#each secret.workloads.nodes as workload}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete this secret?
	</Confirm>
	<Confirm
		confirmText="Delete key"
		variant="danger"
		bind:open={deleteValueOpen}
		onconfirm={deleteValueFromSecret}
	>
		{#snippet header()}
			<Heading>Delete key from secret</Heading>
		{/snippet}
		<p>
			This will permanently delete the key <b>{keyToDelete}</b> from the secret named
			<b>{secret.name}</b>
			from <b>{env}</b>.
		</p>
		{#if secret.workloads.nodes.length > 0}
			<p>These workloads reference the secret:</p>
			<ul>
				{#each secret.workloads.nodes as workload}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete <b>{keyToDelete}</b> from this secret?
	</Confirm>

	<div class="heading">
		<Button
			class="delete-secret"
			title="Delete secret from environment"
			variant="danger"
			size="small"
			onclick={openDeleteModal}
			iconLeft={TrashIcon}
		>
			Delete
		</Button>
	</div>
	<div class="alerts">
		<!--{#if $updateMutation.errors}
			<Alert variant="error">
				{#each $updateMutation.errors as error}
					{error.message}
				{/each}
			</Alert>-->
		{#if $deleteMutation.errors}
			<GraphErrors errors={$deleteMutation.errors} />
		{/if}
	</div>
	<div class="grid">
		<Card columns={8} rows={3}>
			<div class="data-heading">
				<h4>
					Secret data
					<HelpText title="Secret data" placement="right">
						A secret contains a set of key-value pairs.
					</HelpText>
				</h4>
			</div>
			<!--Data initial={secret.values} /-->
			<Table size="small" style="margin-top: 2rem" zebraStripes>
				<Thead>
					<Tr>
						<Th>Key</Th>
						<Th align="right">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each secret.values as value}
						<Tr>
							<Td>
								<p class="key">
									{value.name}
								</p>
							</Td>
							<Td style="width:100px;" align="right">
								<Button
									iconOnly
									size="small"
									variant="tertiary"
									title="Show or edit secret value"
									onclick={() => {
										openEditValueModal(value.name, value.value);
									}}
									iconLeft={DocPencilIcon}
								></Button>

								<Button
									iconOnly
									size="small"
									variant="tertiary-neutral"
									title="Delete key and value"
									onclick={() => {
										openDeleteValueModal(value.name);
									}}
								>
									{#snippet iconLeft()}
										<TrashIcon style="color:var(--a-icon-danger)!important" />
									{/snippet}
								</Button>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			<AddKeyValue initial={secret.values} {team} {env} {secretName} />
		</Card>
		<Card columns={4} rows={1}>
			<Metadata lastModifiedAt={secret.lastModifiedAt} lastModifiedBy={secret.lastModifiedBy} />
		</Card>
		<Card columns={4} rows={1}>
			<Workloads workloads={secret.workloads} />
		</Card>
		<Card columns={4} rows={1}>
			<Manifest {secretName} />
		</Card>
	</div>
{/if}
<Modal bind:open={()=> editValueOpen, ()=>{cancelEditValue()}} width="medium">
	{#snippet header()}
		<Heading>Editing value of key <i>{keyToEdit}</i></Heading>
	{/snippet}
	<div class="entry">
		<Textarea bind:text={valueToEdit} label="Value" description="Example: some-value" />
	</div>
	{#snippet footer()}
		<Button variant="primary" size="small" onclick={editValueForKey}>Save</Button>
		<Button variant="secondary" size="small" onclick={cancelEditValue}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	h4 {
		display: flex;
		font-weight: 400;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	.heading {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.alerts {
		margin-bottom: 1rem;
	}

	.data-heading {
		display: flex;
		justify-content: space-between;
		margin: 1rem 0;
	}
</style>
