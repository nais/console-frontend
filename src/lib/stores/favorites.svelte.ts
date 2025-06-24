import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';

class Favorites {
	private favorites: SvelteSet<string> = $state(new SvelteSet<string>());

	constructor() {
		this.favorites = new SvelteSet<string>();

		if (browser) {
			const storedFavorites = localStorage.getItem('console-favorites');

			if (storedFavorites) {
				this.favorites = new SvelteSet(JSON.parse(storedFavorites));
			}
			// Listen for changes in localStorage
			// This is useful for multi-tab synchronization
			// and will update the favorites store when changes are made in other tabs.
			window.addEventListener('storage', (event) => {
				if (event.key === 'console-favorites') {
					const newFavorites = event.newValue ? JSON.parse(event.newValue) : [];
					this.favorites = new SvelteSet(newFavorites);
				}
			});
		}
	}

	addFavorite(path: string): void {
		this.favorites.add(path);
		this.#saveToLocalStorage();
	}

	removeFavorite(path: string): void {
		this.favorites.delete(path);
		this.#saveToLocalStorage();
	}

	isFavorite(path: string): boolean {
		return this.favorites.has(path);
	}

	getFavorites(): SvelteSet<string> {
		return this.favorites;
	}

	#saveToLocalStorage(): void {
		if (browser) {
			console.log('Saving favorites to localStorage:', Array.from(this.favorites.keys()));
			localStorage.setItem('console-favorites', JSON.stringify(Array.from(this.favorites.keys())));
		}
	}
}

export const favorites = new Favorites();
