export type updateState =
	| {
	env: {
		name: string;
	};
	secrets: {
		name: string;
		id?: string;
		apps: string[];
		data: {
			key: string;
			value: string;
		}[];
	}[];
}[];

export type AddKv = {
	type: 'AddKv';
	data: {
		env: string;
		secret: string;
		key: string;
		value: string;
	}
}

export type DeleteKv = {
	type: 'DeleteKv';
	data: {
		env: string;
		secret: string;
		key: string;
	}
}

export type UndoDeleteKv = {
	type: 'UndoDeleteKv';
	data: {
		env: string;
		secret: string;
		key: string;
		value: string;
	}
}

export type UpdateValue = {
	type: 'UpdateValue';
	data: {
		env: string;
		secret: string;
		key: string;
		value: string;
	}
}

export type operation = AddKv | DeleteKv | UndoDeleteKv | UpdateValue

export function mergeChanges(update: updateState, curr: operation): updateState {
	switch (curr.type) {
		case 'AddKv':
			return update.map((state) => state.env.name === curr.data.env
				? {
					...state,
					secrets:
						state.secrets.map(secret => {
								if (secret.name == curr.data.secret) {
									return {
										...secret,
										data: [...secret.data, { key: curr.data.key, value: curr.data.value }]
									};
								} else {
									return secret;
								}
							}
						)
				}
				: state
			);
		case 'DeleteKv':
			return update.map((state) => state.env.name === curr.data.env
				? {
					...state,
					secrets:
						state.secrets.map(secret => {
								if (secret.name == curr.data.secret) {
									return {
										...secret,
										data: secret.data.filter(d => d.key != curr.data.key)
									};
								} else {
									return secret;
								}
							}
						)
				}
				: state
			);
		case 'UndoDeleteKv':
			// this isn't correct if the operation is called without a DeleteKv in the history
			return update.map((state) => state.env.name === curr.data.env
				? {
					...state,
					secrets:
						state.secrets.map(secret => {
								if (secret.name == curr.data.secret) {
									return {
										...secret,
										data: [...secret.data, { key: curr.data.key, value: curr.data.value }]
									};
								} else {
									return secret;
								}
							}
						)
				}
				: state
			);
		case 'UpdateValue':
			return update.map((state) => state.env.name === curr.data.env
				? {
					...state,
					secrets:
						state.secrets.map(secret => {
								if (secret.name == curr.data.secret) {
									return {
										...secret,
										data: secret.data.map(d => d.key == curr.data.key
											? { key: d.key, value: curr.data.value }
											: d
										)
									};
								} else {
									return secret;
								}
							}
						)
				}
				: state
			);
		default:
			return update;
	}
}

export function filterAddKvs(env: string, secretName: string, ops: operation[]): AddKv[] {
	return ops
		.filter(op => op.type === 'AddKv' && op.data.env === env && op.data.secret === secretName)
		.map((c) => c as AddKv);
}

function filterByKey(env: string, secretName: string, key: string, ops: operation[]): operation[] {
	return ops.filter(c => c.data.env === env && c.data.secret === secretName && c.data.key === key);
}

export function lastOperation(env: string, secretName: string, key: string, ops: operation[]): operation | undefined {
	return filterByKey(env, secretName, key, ops).at(-1);
}

export function includesOperation(env: string, secretName: string, key: string, ops: operation[], type: string): boolean {
	return filterByKey(env, secretName, key, ops).some(c => c.type === type);
}
