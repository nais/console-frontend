import { expect, test } from 'vitest';
import { mergeChanges, type operation } from './state-machinery';
import type { VariableInput } from '$houdini';

const initialState: VariableInput[] = [
	{
		name: 'some-key',
		value: 'some-value'
	}
];

test('add kv', () => {
	const add: operation = {
		type: 'AddKv',
		data: {
			name: 'some-new-key',
			value: 'some-new-value'
		}
	};

	expect(mergeChanges(initialState, add)).toEqual([
		{
			name: 'some-key',
			value: 'some-value'
		},
		{
			name: 'some-new-key',
			value: 'some-new-value'
		}
	]);
});

test('add duplicate kv', () => {
	const add: operation = {
		type: 'AddKv',
		data: {
			name: 'some-key',
			value: 'some-new-value'
		}
	};

	expect(mergeChanges(initialState, add)).toEqual([
		{
			name: 'some-key',
			value: 'some-new-value'
		}
	]);
});

test('delete kv', () => {
	const del: operation = {
		type: 'DeleteKv',
		data: {
			name: 'some-key'
		}
	};

	expect(mergeChanges(initialState, del)).toEqual([]);
});

test('delete exactly one kv', () => {
	const initialState: VariableInput[] = [
		{
			name: 'some-key',
			value: 'some-value'
		},
		{
			name: 'some-other-key',
			value: 'some-other-value'
		}
	];

	const del: operation = {
		type: 'DeleteKv',
		data: {
			name: 'some-key'
		}
	};

	expect(mergeChanges(initialState, del)).toEqual([
		{
			name: 'some-other-key',
			value: 'some-other-value'
		}
	]);
});

test('deleted kv followed by undo deleted kv is a no-op', () => {
	const ops: operation[] = [
		{
			type: 'DeleteKv',
			data: {
				name: 'some-key'
			}
		},
		{
			type: 'UndoDeleteKv',
			data: {
				name: 'some-key',
				value: 'some-value'
			}
		}
	];

	expect(ops.reduce(mergeChanges, initialState)).toEqual(initialState);
});

test('deleted kv followed by multiple undo deleted kv is a no-op', () => {
	const ops: operation[] = [
		{
			type: 'DeleteKv',
			data: {
				name: 'some-key'
			}
		},
		{
			type: 'UndoDeleteKv',
			data: {
				name: 'some-key',
				value: 'some-value'
			}
		},
		{
			type: 'UndoDeleteKv',
			data: {
				name: 'some-key',
				value: 'some-value'
			}
		}
	];

	expect(ops.reduce(mergeChanges, initialState)).toEqual(initialState);
});

test('update value', () => {
	const updateValue: operation = {
		type: 'UpdateValue',
		data: {
			name: 'some-key',
			value: 'some-new-value'
		}
	};

	expect(mergeChanges(initialState, updateValue)).toEqual([
		{
			name: 'some-key',
			value: 'some-new-value'
		}
	]);
});
