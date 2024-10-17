import type { SecretVariableInput } from '$houdini';

export type AddKv = {
	type: 'AddKv';
	data: {
		name: string;
		value: string;
	};
};

export type DeleteKv = {
	type: 'DeleteKv';
	data: {
		name: string;
	};
};

export type UndoDeleteKv = {
	type: 'UndoDeleteKv';
	data: {
		name: string;
		value: string;
	};
};

export type UpdateValue = {
	type: 'UpdateValue';
	data: {
		name: string;
		value: string;
	};
};

export type operation = AddKv | DeleteKv | UndoDeleteKv | UpdateValue;

export function mergeChanges(
	tuples: SecretVariableInput[],
	curr: operation
): SecretVariableInput[] {
	const exists = tuples.some((state) => state.name === curr.data.name);
	const updateValue = (value: string) => {
		return tuples.map((state) =>
			state.name === curr.data.name ? { name: state.name, value } : state
		);
	};
	const append = (value: string) => {
		return [...tuples, { name: curr.data.name, value }];
	};

	switch (curr.type) {
		case 'AddKv':
			return exists ? updateValue(curr.data.value) : append(curr.data.value);
		case 'DeleteKv':
			return tuples.filter((state) => state.name !== curr.data.name);
		case 'UndoDeleteKv':
			return exists ? updateValue(curr.data.value) : append(curr.data.value);
		case 'UpdateValue':
			return updateValue(curr.data.value);
		default:
			return tuples;
	}
}

export function added(initial: SecretVariableInput[], changes: operation[]): SecretVariableInput[] {
	const mutated = changes.reduce(mergeChanges, initial);
	const keys = initial.map((i) => i.name);
	return mutated.filter((m) => !keys.includes(m.name));
}

export function deleted(
	initial: SecretVariableInput[],
	changes: operation[]
): SecretVariableInput[] {
	const mutated = changes.reduce(mergeChanges, initial);
	const keys = mutated.map((m) => m.name);
	return initial.filter((i) => !keys.includes(i.name));
}

export function updated(
	initial: SecretVariableInput[],
	changes: operation[]
): SecretVariableInput[] {
	const mutated = changes.reduce(mergeChanges, initial);
	return initial.filter((i) => {
		const m = mutated.find((m) => m.name === i.name);
		return m && m.value !== i.value;
	});
}

export function addedKey(
	key: string,
	initial: SecretVariableInput[],
	changes: operation[]
): boolean {
	return added(initial, changes).some((m) => m.name === key);
}

export function updatedKey(
	key: string,
	initial: SecretVariableInput[],
	changes: operation[]
): boolean {
	return updated(initial, changes).some((m) => m.name === key);
}
