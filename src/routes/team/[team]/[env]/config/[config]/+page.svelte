<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ValueEncoding, graphql } from '$houdini';
	import Confirm from '$lib/ui/Confirm.svelte';
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

	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import { getConfigPermissions } from '$lib/utils/configPermissions';
	import { DocPencilIcon, DownloadIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import AddKeyValue from './AddKeyValue.svelte';
	import Manifest from './Manifest.svelte';
	import Metadata from './Metadata.svelte';
	import Workloads from './Workloads.svelte';

	let { data }: PageProps = $props();
	let { Config, teamSlug } = $derived(data);
	let config = $derived($Config.data?.team.environment.config);
	let viewerIsMember = $derived($Config.data?.team.viewerIsMember ?? false);
	let isAdmin = $derived($Config.data?.me?.__typename === 'User' ? $Config.data.me.isAdmin : false);
	let permissions = $derived(getConfigPermissions(viewerIsMember, isAdmin));
	let canMutate = $derived(permissions.canMutate);

	let configName = $derived(page.params.config ?? '');
	let env = $derived(page.params.env ?? '');

	let deleteConfigOpen = $state(false);
	let deleteValueOpen = $state(false);
	let editValueOpen = $state(false);

	let keyToDelete = $state('');
	let keyToEdit = $state('');
	let valueToEdit = $state('');

	const updateConfigValue = graphql(`
		mutation updateConfigValue(
			$name: String!
			$team: Slug!
			$env: String!
			$value: ConfigValueInput!
		) {
			updateConfigValue(
				input: { environmentName: $env, name: $name, teamSlug: $team, value: $value }
			) {
				config {
					id
					values {
						name
						value
						encoding
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
		await updateConfigValue.mutate({
			name: configName,
			team: teamSlug,
			env: env,
			value: {
				name: keyToEdit,
				value: valueToEdit
			}
		});

		if ($updateConfigValue.errors) {
			return;
		}

		editValueOpen = false;
		keyToEdit = '';
		Config.fetch();
	};

	const removeConfigValue = graphql(`
		mutation removeConfigValue(
			$configName: String!
			$team: Slug!
			$env: String!
			$valueName: String!
		) {
			removeConfigValue(
				input: {
					environmentName: $env
					configName: $configName
					teamSlug: $team
					valueName: $valueName
				}
			) {
				config {
					id
					values {
						name
						value
						encoding
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

	const deleteValueFromConfig = async () => {
		if (keyToDelete == '') {
			return;
		}
		await removeConfigValue.mutate({
			configName: configName,
			team: teamSlug,
			env: env,
			valueName: keyToDelete
		});

		if ($removeConfigValue.errors) {
			return;
		}

		deleteValueOpen = false;
		Config.fetch();
		keyToDelete = '';
	};

	const deleteMutation = graphql(`
		mutation deleteConfig($name: String!, $team: Slug!, $env: String!) {
			deleteConfig(input: { name: $name, teamSlug: $team, environmentName: $env }) {
				configDeleted
			}
		}
	`);

	const deleteConfig = async () => {
		await deleteMutation.mutate({
			name: configName,
			team: teamSlug,
			env: env
		});

		if ($deleteMutation.errors) {
			return;
		}

		await goto('/team/' + teamSlug + '/configs');
	};

	const openDeleteModal = () => {
		deleteConfigOpen = true;
	};

	const openDeleteValueModal = (key: string) => {
		keyToDelete = key;
		deleteValueOpen = true;
	};

	const openEditValueModal = (key: string, value: string) => {
		if (!canMutate) {
			return;
		}
		keyToEdit = key;
		valueToEdit = value;
		editValueOpen = true;
	};

	const cancelEditValue = () => {
		editValueOpen = false;
		keyToEdit = '';
		valueToEdit = '';
	};

	const isBinaryValue = (entry: { encoding: string }): boolean => {
		return entry.encoding === ValueEncoding.BASE64;
	};

	const formatBinarySize = (base64Value: string): string => {
		const bytes = Math.floor((base64Value.length * 3) / 4);
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const downloadBinaryValue = (name: string, base64Value: string) => {
		const binaryString = atob(base64Value);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		const blob = new Blob([bytes], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
</script>

<GraphErrors errors={$Config.errors} />

{#if $Config.fetching}
	<Loader />
{:else if config}
	<Confirm
		confirmText="Delete"
		variant="danger"
		bind:open={deleteConfigOpen}
		onconfirm={deleteConfig}
	>
		{#snippet header()}
			<Heading as="h1" size="large">Delete Config</Heading>
		{/snippet}
		<p>
			This will permanently delete the config named <b>{config.name}</b>
			from <b>{env}</b>.
		</p>
		{#if config.workloads.nodes.length > 0}
			<p>These workloads still reference the config:</p>
			<ul>
				{#each config.workloads.nodes as workload (workload.id)}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete this config?
	</Confirm>
	<Confirm
		confirmText="Delete key"
		variant="danger"
		bind:open={deleteValueOpen}
		onconfirm={deleteValueFromConfig}
	>
		{#snippet header()}
			<Heading as="h1" size="large">Delete Key From Config</Heading>
		{/snippet}
		<p>
			This will permanently delete the key <b>{keyToDelete}</b> from the config named
			<b>{config.name}</b>
			from <b>{env}</b>.
		</p>
		{#if config.workloads.nodes.length > 0}
			<p>These workloads reference the config:</p>
			<ul>
				{#each config.workloads.nodes as workload (workload.id)}
					<li>
						<WorkloadLink {workload} />
					</li>
				{/each}
			</ul>
			<br />
		{/if}

		Are you sure you want to delete <b>{keyToDelete}</b> from this config?
	</Confirm>

	<div class="wrapper">
		<div class="content">
			<div class="alerts">
				{#if $deleteMutation.errors}
					<GraphErrors errors={$deleteMutation.errors} />
				{/if}
			</div>
			<div class="data-heading">
				<div style="display: flex; align-items: center; gap: var(--ax-space-8);">
					<Heading as="h2">Config Data</Heading>
					<HelpText title="Config data" placement="right">
						A config contains a set of key-value pairs that can be used as environment variables
						(envFrom) or mounted as files (filesFrom) in your workloads.
					</HelpText>
				</div>
				<div class="header-buttons">
					{#if canMutate}
						<Button
							class="delete-config"
							title="Delete config from environment"
							variant="danger"
							size="small"
							onclick={openDeleteModal}
							icon={TrashIcon}
						>
							Delete
						</Button>
					{/if}
				</div>
			</div>

			<div class="table-container">
				<Table size="small" style="margin-top: 2rem">
					<Thead>
						<Tr>
							<Th>Key</Th>
							<Th>Value</Th>
							<Th align="right">Actions</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each config.values as entry (entry.name)}
							<Tr>
								<Td>
									<p class="key">
										{entry.name}
									</p>
								</Td>
								<Td>
									{#if isBinaryValue(entry)}
										<span class="binary-label">Binary data ({formatBinarySize(entry.value)})</span>
									{:else}
										<code class="value">
											{entry.value}
										</code>
									{/if}
								</Td>
								<Td style="width: 120px" align="right">
									<div class="buttons">
										{#if isBinaryValue(entry)}
											<Button
												size="small"
												variant="tertiary"
												title="Download binary value"
												onclick={() => downloadBinaryValue(entry.name, entry.value)}
												icon={DownloadIcon}
											/>
										{:else}
											<CopyButton
												activeText="Value copied"
												variant="action"
												size="small"
												copyText={entry.value}
											/>
											{#if canMutate}
												<Button
													size="small"
													variant="tertiary"
													title="Edit config value"
													onclick={() => {
														openEditValueModal(entry.name, entry.value);
													}}
													icon={DocPencilIcon}
												/>
											{/if}
										{/if}
										{#if canMutate}
											<Button
												size="small"
												variant="tertiary-neutral"
												title="Delete key and value"
												onclick={() => {
													openDeleteValueModal(entry.name);
												}}
											>
												{#snippet icon()}
													<TrashIcon style="color:var(--ax-text-danger-decoration)!important" />
												{/snippet}
											</Button>
										{/if}
									</div>
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</div>
			{#if canMutate}
				<AddKeyValue
					initial={config.values.map((v) => ({ name: v.name }))}
					{teamSlug}
					{env}
					{configName}
					onSuccess={() => {
						Config.fetch();
					}}
				/>
			{/if}
		</div>
		<div class="sidebar">
			<Metadata lastModifiedAt={config.lastModifiedAt} lastModifiedBy={config.lastModifiedBy} />
			<Workloads workloads={config.workloads} />
			<Manifest {configName} />
			{#if config}
				<SidebarActivity activityLog={config} direct={config.activityLog} />
			{/if}
		</div>
	</div>
{/if}
<Modal bind:open={editValueOpen} onclose={cancelEditValue} width="medium">
	{#snippet header()}
		<Heading as="h1" size="large">Editing Value of Key <i>{keyToEdit}</i></Heading>
	{/snippet}
	{#if ($Config.data?.team.environment.config.workloads.nodes ?? []).length > 0}
		<Alert variant="info" size="small">
			<BodyShort
				>Editing this config will cause a restart of the applications listed below.</BodyShort
			>
			<ul>
				{#each $Config.data?.team.environment.config.workloads.nodes ?? [] as workload (workload.id)}
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
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
		align-items: start;
		min-width: 0;
	}

	.content {
		min-width: 0;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		min-width: 0;
	}

	.buttons {
		justify-content: flex-end;
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
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.header-buttons {
		display: flex;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
	}

	.table-container {
		max-width: 100%;
		min-width: 0;
		overflow-x: auto;
	}

	.table-container :global(table) {
		width: max-content;
		min-width: 100%;
	}

	.value {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}

	.binary-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
		font-style: italic;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 0 1rem;
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

		.data-heading {
			flex-direction: column;
		}

		.header-buttons {
			width: 100%;
			justify-content: flex-start;
		}
	}
</style>
