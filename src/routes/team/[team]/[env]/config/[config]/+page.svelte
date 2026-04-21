<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
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
	import { getContextClient } from '$lib/urql/context';
	import { ValueEncoding } from '$lib/urql/gql/graphql';
	import { getConfigPermissions } from '$lib/utils/configPermissions';
	import { DocPencilIcon, DownloadIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import AddKeyValue from './AddKeyValue.svelte';
	import {
		DeleteConfigMutation,
		RemoveConfigValueMutation,
		UpdateConfigValueMutation
	} from './config';
	import Manifest from './Manifest.svelte';
	import Metadata from './Metadata.svelte';
	import Workloads from './Workloads.svelte';

	let { data }: PageProps = $props();
	let { Config, teamSlug } = $derived(data);
	let config = $derived(Config.data?.team.environment.config);
	let viewerIsMember = $derived(Config.data?.team.viewerIsMember ?? false);
	let isAdmin = $derived(Config.data?.me?.__typename === 'User' ? Config.data.me.isAdmin : false);
	let permissions = $derived(getConfigPermissions(viewerIsMember, isAdmin));
	let canMutate = $derived(permissions.canMutate);

	let configName = $derived(page.params.config ?? '');
	let env = $derived(page.params.env ?? '');

	const client = getContextClient();

	let deleteConfigOpen = $state(false);
	let deleteValueOpen = $state(false);
	let editValueOpen = $state(false);

	let keyToDelete = $state('');
	let keyToEdit = $state('');
	let valueToEdit = $state('');

	let updateValueErrors = $state<{ message: string }[] | null>(null);
	let removeValueErrors = $state<{ message: string }[] | null>(null);
	let deleteConfigErrors = $state<{ message: string }[] | null>(null);

	const editValueForKey = async () => {
		if (keyToEdit == '') {
			return;
		}
		const result = await client
			.mutation(UpdateConfigValueMutation, {
				name: configName,
				team: teamSlug,
				env: env,
				value: {
					name: keyToEdit,
					value: valueToEdit
				}
			})
			.toPromise();

		if (result.error) {
			updateValueErrors = result.error.graphQLErrors?.length
				? result.error.graphQLErrors.map((e) => ({ message: e.message }))
				: [{ message: result.error.message }];
			return;
		}

		updateValueErrors = null;
		editValueOpen = false;
		keyToEdit = '';
		void invalidateAll();
	};

	const deleteValueFromConfig = async () => {
		if (keyToDelete == '') {
			return;
		}
		const result = await client
			.mutation(RemoveConfigValueMutation, {
				configName: configName,
				team: teamSlug,
				env: env,
				valueName: keyToDelete
			})
			.toPromise();

		if (result.error) {
			removeValueErrors = result.error.graphQLErrors?.length
				? result.error.graphQLErrors.map((e) => ({ message: e.message }))
				: [{ message: result.error.message }];
			return;
		}

		removeValueErrors = null;
		deleteValueOpen = false;
		keyToDelete = '';
		void invalidateAll();
	};

	const deleteConfig = async () => {
		const result = await client
			.mutation(DeleteConfigMutation, {
				name: configName,
				team: teamSlug,
				env: env
			})
			.toPromise();

		if (result.error) {
			deleteConfigErrors = result.error.graphQLErrors?.length
				? result.error.graphQLErrors.map((e) => ({ message: e.message }))
				: [{ message: result.error.message }];
			return;
		}

		deleteConfigErrors = null;
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

<GraphErrors errors={Config.errors} />

{#if !Config.data && !Config.errors}
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
		<GraphErrors errors={removeValueErrors} />

		Are you sure you want to delete <b>{keyToDelete}</b> from this config?
	</Confirm>

	<div class="wrapper">
		<div>
			<div class="alerts">
				<GraphErrors errors={deleteConfigErrors} />
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
			{#if canMutate}
				<AddKeyValue
					initial={config.values.map((v) => ({ name: v.name }))}
					{teamSlug}
					{env}
					{configName}
					onSuccess={() => {
						void invalidateAll();
					}}
				/>
			{/if}
		</div>
		<div class="sidebar">
			<Metadata
				lastModifiedAt={config.lastModifiedAt ? new Date(config.lastModifiedAt) : null}
				lastModifiedBy={config.lastModifiedBy ?? null}
			/>
			<Workloads workloads={config.workloads} />
			<Manifest {configName} />
			<SidebarActivity activityLog={config} />
		</div>
	</div>
{/if}
<Modal bind:open={editValueOpen} onclose={cancelEditValue} width="medium">
	{#snippet header()}
		<Heading as="h1" size="large">Editing Value of Key <i>{keyToEdit}</i></Heading>
	{/snippet}
	{#if (Config.data?.team.environment.config.workloads.nodes ?? []).length > 0}
		<Alert variant="info" size="small">
			<BodyShort
				>Editing this config will cause a restart of the applications listed below.</BodyShort
			>
			<ul>
				{#each Config.data?.team.environment.config.workloads.nodes ?? [] as workload (workload.id)}
					<li><WorkloadLink {workload} /></li>
				{/each}
			</ul>
		</Alert>
	{/if}
	<div class="entry">
		<Textarea bind:text={valueToEdit} label="Value" description="Example: some-value" />
	</div>
	<GraphErrors errors={updateValueErrors} />
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
		justify-content: space-between;
		gap: 0.5rem;
	}

	.header-buttons {
		display: flex;
		gap: var(--ax-space-8);
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
</style>
