<script lang="ts">
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { untrack } from 'svelte';

	import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { Compartment, EditorState } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { EditorView } from '@codemirror/view';
	import { PromQLExtension } from '@prometheus-io/codemirror-promql';

	let { code = '', wrap = true, className = '' } = $props();

	const themeComp = new Compartment();
	const wrapComp = new Compartment();

	const themeExt = (dark: boolean) =>
		dark ? oneDark : syntaxHighlighting(defaultHighlightStyle, { fallback: true });

	const wrapExt = (enable: boolean) => (enable ? EditorView.lineWrapping : []);

	function setupEditor(host: HTMLDivElement) {
		const promqlExt = new PromQLExtension();

		const view = new EditorView({
			parent: host,
			state: EditorState.create({
				doc: untrack(() => code),
				extensions: [
					EditorView.editable.of(false),
					themeComp.of(themeExt(untrack(() => themeSwitch.theme === 'dark'))),
					wrapComp.of(wrapExt(untrack(() => wrap))),
					promqlExt.asExtension()
				]
			})
		});

		$effect(() => {
			if (code !== view.state.doc.toString()) {
				view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
			}
		});

		$effect(() => {
			view.dispatch({ effects: wrapComp.reconfigure(wrapExt(wrap)) });
		});

		$effect(() => {
			const isDark = themeSwitch.theme === 'dark';
			view.dispatch({ effects: themeComp.reconfigure(themeExt(isDark)) });
		});

		return () => view.destroy();
	}
</script>

<div class={'cm-host ' + className} {@attach setupEditor}></div>

<style>
	.cm-host :global(.cm-editor) {
		border-radius: var(--ax-radius-8);
		border: 1px solid var(--ax-border-neutral-subtle);
		background: var(--ax-bg-neutral-moderate);
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.9rem;
	}
	.cm-host :global(.cm-editor.cm-focused) {
		outline: 2px solid var(--ax-border-focus);
		outline-offset: -2px;
	}
	.cm-host :global(.cm-content) {
		padding: var(--ax-space-12);
	}
</style>
