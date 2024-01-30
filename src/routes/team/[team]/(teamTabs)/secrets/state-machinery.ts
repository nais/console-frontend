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
}[]
	| undefined;

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

export type EditedKv = {
	type: 'EditedKv';
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

export type UpdateKey = {
	type: 'UpdateKey';
	data: {
		env: string;
		secret: string;
		oldKey: string;
		key: string;
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

export type operation = AddKv | DeleteKv | EditedKv | UndoDeleteKv | UpdateKey | UpdateValue

export function mergeChanges(update: updateState, curr: operation): updateState {
	if (update) {
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
			case 'EditedKv':
				return update
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
			case 'UpdateKey':
				return update.map((state) => state.env.name === curr.data.env
					? {
						...state,
						secrets:
							state.secrets.map(secret => {
									if (secret.name == curr.data.secret) {
										return {
											...secret,
											data: secret.data.map(d => d.key == curr.data.oldKey
												? { key: curr.data.key, value: d.value }
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
		}
	}
}
