<script lang="ts">
	import '$lib/../styles/aksel-highlight.css';
	import hljs from 'highlight.js';
	import { marked, type Tokens } from 'marked';

	interface Props {
		content: string;
	}

	let { content }: Props = $props();

	// Custom renderer for code blocks with syntax highlighting
	const renderer = new marked.Renderer();

	renderer.code = ({ text, lang }: Tokens.Code): string => {
		const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
		const highlighted = hljs.highlight(text, { language }).value;
		return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
	};

	// Custom renderer for inline code
	renderer.codespan = ({ text }: Tokens.Codespan): string => {
		return `<code class="inline-code">${text}</code>`;
	};

	// Configure marked for safe rendering
	marked.setOptions({
		gfm: true,
		breaks: true,
		renderer
	});

	const html = $derived(marked.parse(content) as string);
</script>

<div class="chat-markdown">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>

<style>
	.chat-markdown {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.chat-markdown :global(p) {
		margin: 0 0 var(--ax-space-8) 0;
	}

	.chat-markdown :global(p:last-child) {
		margin-bottom: 0;
	}

	.chat-markdown :global(ul),
	.chat-markdown :global(ol) {
		margin: var(--ax-space-8) 0;
		padding-left: var(--ax-space-20);
	}

	.chat-markdown :global(li) {
		margin-bottom: var(--ax-space-4);
	}

	.chat-markdown :global(h1),
	.chat-markdown :global(h2),
	.chat-markdown :global(h3),
	.chat-markdown :global(h4) {
		margin: var(--ax-space-12) 0 var(--ax-space-8) 0;
		font-weight: var(--ax-font-weight-semibold);
	}

	.chat-markdown :global(blockquote) {
		border-left: 3px solid var(--ax-border-default);
		margin: var(--ax-space-8) 0;
		padding-left: var(--ax-space-12);
		color: var(--ax-text-subtle);
	}

	/* Code block styling */
	.chat-markdown :global(pre) {
		margin: var(--ax-space-8) 0;
		border-radius: var(--ax-border-radius-medium);
		overflow-x: auto;
	}

	.chat-markdown :global(pre code) {
		display: block;
		padding: var(--ax-space-12);
		font-family: var(--ax-font-family-mono, monospace);
		font-size: var(--ax-font-size-small);
		line-height: 1.5;
		tab-size: 2;
	}

	/* Inline code styling */
	.chat-markdown :global(.inline-code) {
		background-color: var(--ax-bg-subtle);
		border-radius: var(--ax-border-radius-small);
		padding: 0.125em 0.375em;
		font-family: var(--ax-font-family-mono, monospace);
		font-size: 0.9em;
	}

	/* Table styling */
	.chat-markdown :global(table) {
		border-collapse: collapse;
		margin: var(--ax-space-8) 0;
		width: 100%;
		overflow-x: auto;
		display: block;
	}

	.chat-markdown :global(th),
	.chat-markdown :global(td) {
		border: 1px solid var(--ax-border-default);
		padding: var(--ax-space-8);
		text-align: left;
	}

	.chat-markdown :global(th) {
		background-color: var(--ax-bg-subtle);
		font-weight: var(--ax-font-weight-semibold);
	}

	/* Horizontal rule */
	.chat-markdown :global(hr) {
		border: none;
		border-top: 1px solid var(--ax-border-default);
		margin: var(--ax-space-16) 0;
	}

	/* Links */

	.chat-markdown :global(a:hover) {
		text-decoration: underline;
	}
</style>
