import { expect, test } from 'vitest';
import { mergeChanges, type operation, type updateState } from './state-machinery';

const initialState: updateState = [
	{
		key: 'some-key',
		value: 'some-value'
	}
];

test('add kv', () => {
	const add: operation = {
		type: 'AddKv',
		data: {
			key: 'some-new-key',
			value: 'some-new-value'
		}
	};

	expect(mergeChanges(initialState, add)).toEqual([
		{
			key: 'some-key',
			value: 'some-value'
		},
		{
			key: 'some-new-key',
			value: 'some-new-value'
		}
	]);
});

test('delete kv', () => {
	const del: operation = {
		type: 'DeleteKv',
		data: {
			key: 'some-key'
		}
	};

	expect(mergeChanges(initialState, del)).toEqual([]);
});

test('delete exactly one kv', () => {
	const initialState: updateState = [
		{
			key: 'some-key',
			value: 'some-value'
		},
		{
			key: 'some-other-key',
			value: 'some-other-value'
		}
	];

	const del: operation = {
		type: 'DeleteKv',
		data: {
			key: 'some-key'
		}
	};

	expect(mergeChanges(initialState, del)).toEqual([
		{
			key: 'some-other-key',
			value: 'some-other-value'
		}
	]);
});

test('deleted kv followed by undo deleted kv is a no-op', () => {
	const ops: operation[] = [
		{
			type: 'DeleteKv',
			data: {
				key: 'some-key'
			}
		},
		{
			type: 'UndoDeleteKv',
			data: {
				key: 'some-key',
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
			key: 'some-key',
			value: 'some-new-value'
		}
	};

	expect(mergeChanges(initialState, updateValue)).toEqual([
		{
			key: 'some-key',
			value: 'some-new-value'
		}
	]);
});
