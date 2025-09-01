<script lang="ts">
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { onMount } from 'svelte';

	import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { Compartment, EditorState } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { EditorView } from '@codemirror/view';
	import { PromQLExtension } from '@prometheus-io/codemirror-promql';

	let { code = '', wrap = true, className = '' } = $props();

	let host: HTMLDivElement;
	let view: EditorView | null = null;

	const themeComp = new Compartment();
	const wrapComp = new Compartment();

	const themeExt = (dark: boolean) =>
		dark ? oneDark : syntaxHighlighting(defaultHighlightStyle, { fallback: true });

	const wrapExt = (enable: boolean) => (enable ? EditorView.lineWrapping : []);

	onMount(() => {
		const promqlExt = new PromQLExtension();

		view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: code,
				extensions: [
					EditorView.editable.of(false),
					themeComp.of(themeExt(themeSwitch.theme === 'dark')),
					wrapComp.of(wrapExt(wrap)),
					promqlExt.asExtension()
				]
			})
		});

		return () => {
			view?.destroy();
			view = null;
		};
	});

	$effect(() => {
		if (!view) return;
		if (code !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
		}
	});

	$effect(() => {
		if (!view) return;
		view.dispatch({ effects: wrapComp.reconfigure(wrapExt(wrap)) });
	});

	$effect(() => {
		if (!view) return;
		const isDark = themeSwitch.theme === 'dark';
		view.dispatch({ effects: themeComp.reconfigure(themeExt(isDark)) });
	});
</script>

<div class={'cm-host ' + className} bind:this={host}></div>

<style>
	.cm-host :global(.cm-editor) {
		border-radius: 6px;
		border: 1px solid var(--ax-border-neutral-subtle);
		background: var(--ax-bg-neutral-moderate);
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
