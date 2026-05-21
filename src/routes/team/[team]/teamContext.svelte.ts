import { getContext, setContext } from 'svelte';

const ctxKey = Symbol('team');

class TeamContext {
	mobileMenuOpen = $state(false);

	openMobileMenu() {
		this.mobileMenuOpen = true;
	}

	closeMobileMenu() {
		this.mobileMenuOpen = false;
	}
}

export function createTeamContext() {
	const context = new TeamContext();
	setContext(ctxKey, context);
}

export function getTeamContext() {
	return getContext<TeamContext>(ctxKey);
}
