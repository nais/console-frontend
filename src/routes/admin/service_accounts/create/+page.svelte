<script lang="ts">
	import { page } from '$app/state';
	import CreateServiceAccountForm from '$lib/domain/service-accounts/CreateServiceAccountForm.svelte';

	const form = $derived(page.form);
</script>

<CreateServiceAccountForm formData={form} />
