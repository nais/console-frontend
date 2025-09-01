<script lang="ts">
	import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { Compartment, EditorState } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { EditorView } from '@codemirror/view';
	import { PromQLExtension } from '@prometheus-io/codemirror-promql';
	import { onMount } from 'svelte';

	// ✅ Single $props() call
	let { code = '', wrap = true, dark = false, className = '' } = $props();

	let host: HTMLDivElement;
	let view: EditorView | null = null;

	// Compartments for dynamic reconfig
	const themeComp = new Compartment();
	const wrapComp = new Compartment();

	const themeExt = () =>
		dark ? oneDark : syntaxHighlighting(defaultHighlightStyle, { fallback: true });
	const wrapExt = () => (wrap ? EditorView.lineWrapping : []);

	onMount(() => {
		const promqlExt = new PromQLExtension();

		view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: code,
				extensions: [
					EditorView.editable.of(false), // read-only
					themeComp.of(themeExt()),
					wrapComp.of(wrapExt()),
					promqlExt.asExtension()
				]
			})
		});

		return () => view?.destroy();
	});

	// Svelte 5 reactivity
	$effect(() => {
		if (view && code !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
		}
	});

	$effect(() => {
		if (view) view.dispatch({ effects: themeComp.reconfigure(themeExt()) });
	});

	$effect(() => {
		if (view) view.dispatch({ effects: wrapComp.reconfigure(wrapExt()) });
	});
</script>

<div class={'cm-host ' + className} bind:this={host}></div>

<style>
	.cm-host :global(.cm-editor) {
		border-radius: 6px;
		border: 1px solid var(--ax-border-neutral-subtle, #e5e7eb);
		background: var(--ax-bg-subtle, #f9fafb);
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.9rem;
	}
	.cm-host :global(.cm-editor.cm-focused) {
		outline: none;
	}
	.cm-host :global(.cm-content) {
		padding: 10px 12px;
	}
</style>
