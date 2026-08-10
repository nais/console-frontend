<script lang="ts">
	import { serviceAccountForm } from '$lib/forms/serviceaccounts';
	import Form from '$lib/ui/Form/Form.svelte';
	import type { FormProps } from '$lib/ui/Form/form';

	const {
		formData
	}: {
		formData: FormProps<(typeof serviceAccountForm)[number]> | null;
	} = $props();
</script>

<Form fields={serviceAccountForm} form={formData} button="Create service account" />
