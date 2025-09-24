import { getContext, setContext } from 'svelte';

const ctxKey = Symbol('team');

class TeamContext {
	refetchInventory() {
		this.inventoryFetcher?.();
	}

	inventoryFetcher?: () => void;
}

export function createTeamContext() {
	const context = new TeamContext();
	setContext(ctxKey, context);
}

export function setInventoryRefetcher(refetcher: () => void) {
	const ctx = getContext<TeamContext>(ctxKey);
	ctx.inventoryFetcher = refetcher;
}

export function getTeamContext() {
	return getContext<TeamContext>(ctxKey);
}
