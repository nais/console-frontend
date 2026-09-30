<script lang="ts">
	import SearchField from './SearchField.svelte';
	import Textarea from './Textarea.svelte';
</script>

<SearchField label="First search" />
<SearchField label="Second search" />
<Textarea label="First notes" text="" />
<Textarea label="Second notes" text="" id="explicit-notes" />
