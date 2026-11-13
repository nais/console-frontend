<script lang="ts">
	import UserSettingsMenu from '../../src/routes/UserSettingsMenu.svelte';
	import { themeSwitch } from '../../src/lib/stores/theme.svelte.js';
	import {
		BodyShort,
		Button,
		Heading,
		Table,
		Tbody,
		Td,
		TextField,
		Theme,
		Tr
	} from '../../src/lib/shadcn/ui/index.js';

	const params = new URLSearchParams(location.search);
	themeSwitch.theme = params.has('dark') ? 'dark' : 'light';
</script>

<Theme theme={themeSwitch.theme}>
	<main>
		<UserSettingsMenu>
			{#snippet trigger(props)}<Button {...props}>User settings</Button>{/snippet}
		</UserSettingsMenu>
		<Heading as="h1" size="medium">User settings</Heading>
		<BodyShort>Sample body text</BodyShort>
		<TextField label="Sample field" value="Readable content" />
		<div class="table-scroll">
			<Table>
				<Tbody><Tr><Td>Sample table text</Td></Tr></Tbody>
			</Table>
		</div>
		<pre><code class="hljs">Sample code text</code></pre>
		<Button>Sample button</Button>
	</main>
</Theme>

<style>
	main {
		display: grid;
		gap: var(--nais-space-16);
		padding: var(--nais-space-16);
		background: var(--background);
		color: var(--foreground);
	}
</style>
