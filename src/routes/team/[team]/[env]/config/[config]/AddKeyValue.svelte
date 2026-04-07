<script lang="ts">
	import { ValueEncoding, graphql, type ValueEncoding$options } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Textarea from '$lib/ui/Textarea.svelte';
	import { Alert, Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import { PlusCircleFillIcon, UploadIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		initial: { name: string }[];
		teamSlug: string;
		env: string;
		configName: string;
		onSuccess?: () => void | Promise<void>;
	}

	let { initial, teamSlug, env, configName, onSuccess }: Props = $props();

	let open: boolean = $state(false);

	const validKey = (key: string | undefined) => {
		if (!key) {
			return '';
		}

		const existingKeys = initial.map((kv) => kv.name);
		if (existingKeys.includes(key)) {
			return 'Key already exists';
		}

		if (key.length > 253) {
			return 'Must be less than 253 characters';
		}

		if (/^[-._a-zA-Z0-9]+$/.test(key) === false) {
			return 'Must consist of letters, numbers, or certain special characters (underscores, hyphens, and periods)';
		}

		if (/^[a-zA-Z_.-]+/.test(key) === false) {
			return 'Must start with a letter or one of the following special characters: (underscores, hyphens, and periods)';
		}
		return '';
	};

	const addConfigValueMutation = graphql(`
		mutation addConfigValue(
			$name: String!
			$team: Slug!
			$env: String!
			$value: ConfigValueInput!
		) {
			addConfigValue(
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

	const isValidUtf8 = (bytes: Uint8Array): boolean => {
		try {
			const decoder = new TextDecoder('utf-8', { fatal: true });
			decoder.decode(bytes);
			return true;
		} catch {
			return false;
		}
	};

	const addConfigValue = async () => {
		if (!key || !hasValue) {
			return;
		}

		const submitValue = fileName ? fileValue : value;
		const submitEncoding = fileName ? fileEncoding : ValueEncoding.PLAIN_TEXT;

		await addConfigValueMutation.mutate({
			value: {
				name: key,
				value: submitValue,
				encoding: submitEncoding
			},
			team: teamSlug,
			env: env,
			name: configName
		});

		if ($addConfigValueMutation.errors) {
			return;
		}

		open = false;
		reset();

		if (onSuccess) {
			await onSuccess();
		}
	};

	let key: string = $state('');
	let value: string = $state('');
	let fileName: string = $state('');
	let fileValue: string = $state('');
	let fileEncoding: ValueEncoding$options = $state(ValueEncoding.PLAIN_TEXT);
	let fileInput: HTMLInputElement | undefined = $state();

	let hasValue = $derived(fileName ? fileValue !== '' : value !== '');

	const MAX_FILE_SIZE = 1024 * 1024; // 1 MiB
	let fileSizeError: string = $state('');

	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			clearFile();
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			clearFile();
			fileSizeError = 'File exceeds the maximum size of 1 MiB';
			return;
		}

		fileSizeError = '';
		fileName = file.name;
		value = '';

		const reader = new FileReader();
		reader.onload = () => {
			const bytes = new Uint8Array(reader.result as ArrayBuffer);

			if (isValidUtf8(bytes)) {
				const decoder = new TextDecoder('utf-8');
				fileValue = decoder.decode(bytes);
				fileEncoding = ValueEncoding.PLAIN_TEXT;
			} else {
				let binary = '';
				for (let i = 0; i < bytes.length; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				fileValue = btoa(binary);
				fileEncoding = ValueEncoding.BASE64;
			}
		};
		reader.readAsArrayBuffer(file);
	};

	const clearFile = () => {
		fileName = '';
		fileValue = '';
		fileEncoding = ValueEncoding.PLAIN_TEXT;
		fileSizeError = '';
		if (fileInput) {
			fileInput.value = '';
		}
	};

	const openModal = () => {
		open = true;
	};

	const reset = () => {
		open = false;
		key = '';
		value = '';
		clearFile();
	};
</script>

<div class="buttons">
	<Button
		title="Add new key and value"
		variant="tertiary"
		size="small"
		onclick={openModal}
		icon={PlusCircleFillIcon}
	>
		Add key and value
	</Button>
</div>
<Modal bind:open onclose={reset} width="medium">
	{#snippet header()}
		<Heading as="h1" size="large">Add new key and value</Heading>
	{/snippet}
	<div class="content">
		<TextField
			style="font-family: monospace; font-size: var(--ax-font-size-small);"
			size="small"
			bind:value={key}
			error={validKey(key)}
			description="Examples: SOME_KEY, some.key, or some-key"
			label="Key"
		/>

		{#if fileName}
			<div class="file-selected">
				<span class="file-selected-name">{fileName}</span>
				<Button variant="tertiary" size="small" onclick={clearFile}>Remove</Button>
			</div>
		{:else}
			<Textarea bind:text={value} label="Value" description="Example: some-value" />
		{/if}

		<div class="file-upload">
			<input
				bind:this={fileInput}
				type="file"
				onchange={handleFileChange}
				class="file-upload-hidden"
				tabindex="-1"
			/>
			<div class="separator">
				<hr />
				<span>or</span>
				<hr />
			</div>
			<Button variant="secondary" size="small" icon={UploadIcon} onclick={() => fileInput?.click()}>
				Upload from file
			</Button>
			{#if fileSizeError}
				<Alert variant="error" size="small">{fileSizeError}</Alert>
			{/if}
		</div>
	</div>

	<GraphErrors errors={$addConfigValueMutation.errors} />

	{#snippet footer()}
		<Button
			variant="primary"
			size="small"
			onclick={addConfigValue}
			disabled={key === '' || !hasValue || validKey(key) !== ''}
		>
			Add
		</Button>
		<Button variant="secondary" size="small" onclick={reset}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.file-upload-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.file-upload {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.separator {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		width: 100%;
		color: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
	}

	.separator hr {
		flex: 1;
		border: none;
		border-top: 1px solid var(--ax-border-neutral-subtleA);
	}

	.file-selected {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--ax-space-8) var(--ax-space-12);
		background-color: var(--ax-neutral-100);
		border-radius: 4px;
	}

	.file-selected-name {
		font-size: var(--ax-font-size-small);
		font-family: monospace;
	}
</style>
