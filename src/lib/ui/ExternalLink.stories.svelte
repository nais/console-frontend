<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';

	const { Story } = defineMeta({
		component: ExternalLink,
		tags: ['autodocs']
	});
</script>

<Story name="Documentation link" asChild>
	<ExternalLink href="https://doc.nais.io">Read the documentation</ExternalLink>
</Story>

<Story name="GitHub link" asChild>
	<ExternalLink href="https://github.com/nais/console-frontend">View source code</ExternalLink>
</Story>

<Story name="In paragraph" asChild>
	<p>
		Learn more about NAIS in the <ExternalLink href="https://doc.nais.io"
			>official documentation</ExternalLink
		>.
	</p>
</Story>
