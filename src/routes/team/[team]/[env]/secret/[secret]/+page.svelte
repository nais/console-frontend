<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Alert,
		BodyShort,
		Button,
		CopyButton,
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
	import type { PageProps } from './$types';
	import AddKeyValue from './AddKeyValue.svelte';
	import Manifest from './Manifest.svelte';
	import Metadata from './Metadata.svelte';
	import Textarea from './Textarea.svelte';
	import Workloads from './Workloads.svelte';

	let { data }: PageProps = $props();

	let { Secret, teamSlug } = $derived(data);
	let secret = $derived($Secret.data?.team.environment.secret);

	let secretName = $derived(page.params.secret);
	let env = $derived(page.params.env);

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
			team: teamSlug,
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
			team: teamSlug,
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
			team: teamSlug,
			env: env
		});

		if ($deleteMutation.errors) {
			return;
		}

		await goto('/team/' + teamSlug + '/secrets');
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
			<Heading level="1" size="large">Delete Secret</Heading>
		{/snippet}
		<p>
			This will permanently delete the secret named <b>{secret.name}</b> from <b>{env}</b>.
		</p>
		{#if secret.workloads.nodes.length > 0}
			<p>These workloads still reference the secret:</p>
			<ul>
				{#each secret.workloads.nodes as workload (workload.id)}
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
			<Heading level="1" size="large">Delete Key From Secret</Heading>
		{/snippet}
		<p>
			This will permanently delete the key <b>{keyToDelete}</b> from the secret named
			<b>{secret.name}</b>
			from <b>{env}</b>.
		</p>
		{#if secret.workloads.nodes.length > 0}
			<p>These workloads reference the secret:</p>
			<ul>
				{#each secret.workloads.nodes as workload (workload.id)}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete <b>{keyToDelete}</b> from this secret?
	</Confirm>
	<div
		style="display: flex; flex-direction: row; justify-content: flex-end; padding-bottom: var(--spacing-layout);"
	>
		<Button
			class="delete-secret"
			title="Delete secret from environment"
			variant="danger"
			size="small"
			onclick={openDeleteModal}
			icon={TrashIcon}
		>
			Delete
		</Button>
	</div>
	<div class="wrapper">
		<div>
			<div class="alerts">
				{#if $deleteMutation.errors}
					<GraphErrors errors={$deleteMutation.errors} />
				{/if}
			</div>
			<div class="data-heading">
				<Heading level="2">Secret Data</Heading>
				<HelpText title="Secret data" placement="right">
					A secret contains a set of key-value pairs.
				</HelpText>
			</div>
			<Table size="small" style="margin-top: 2rem">
				<Thead>
					<Tr>
						<Th>Key</Th>
						<Th align="right">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each secret.values as value (value.name)}
						<Tr>
							<Td>
								<p class="key">
									{value.name}
								</p>
							</Td>
							<Td style="width: 100px" align="right">
								<div class="buttons">
									<CopyButton
										activeText="Value copied"
										variant="action"
										size="small"
										copyText={value.value}
									/>
									<Button
										size="small"
										variant="tertiary"
										title="Show or edit secret value"
										onclick={() => {
											openEditValueModal(value.name, value.value);
										}}
										icon={DocPencilIcon}
									/>

									<Button
										size="small"
										variant="tertiary-neutral"
										title="Delete key and value"
										onclick={() => {
											openDeleteValueModal(value.name);
										}}
									>
										{#snippet icon()}
											<TrashIcon style="color:var(--ax-text-danger-decoration)!important" />
										{/snippet}
									</Button>
								</div>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			<AddKeyValue initial={secret.values} {teamSlug} {env} {secretName} />
		</div>
		<div class="sidebar">
			<Metadata lastModifiedAt={secret.lastModifiedAt} lastModifiedBy={secret.lastModifiedBy} />
			<Workloads workloads={secret.workloads} />
			<Manifest {secretName} />
		</div>
	</div>
{/if}
<Modal bind:open={editValueOpen} onclose={cancelEditValue} width="medium">
	{#snippet header()}
		<Heading level="1" size="large">Editing Value of Key <i>{keyToEdit}</i></Heading>
	{/snippet}
	{#if ($Secret.data?.team.environment.secret.workloads.nodes ?? []).length > 0}
		<Alert variant="info" size="small">
			<BodyShort
				>Editing this secret will cause a restart of the applications listed below.</BodyShort
			>
			<ul>
				{#each $Secret.data?.team.environment.secret.workloads.nodes ?? [] as workload (workload.id)}
					<li><WorkloadLink {workload} /></li>
				{/each}
			</ul>
		</Alert>
	{/if}
	<div class="entry">
		<Textarea bind:text={valueToEdit} label="Value" description="Example: some-value" />
	</div>
	{#snippet footer()}
		<Button variant="primary" size="small" onclick={editValueForKey}>Save</Button>
		<Button variant="secondary" size="small" onclick={cancelEditValue}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.buttons {
		display: flex;
	}

	.alerts {
		margin-bottom: 1rem;
	}
	.entry {
		margin: 2rem 0;
	}

	.data-heading {
		display: flex;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1rem;
	}
</style>
