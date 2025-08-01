import { browser } from '$app/environment';

class Favorites {
	// Reactive state: array of unique paths
	private favorites: string[] = $state([]);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('console-favorites');
			if (stored) {
				this.favorites = JSON.parse(stored);
			}

			window.addEventListener('storage', (event) => {
				if (event.key === 'console-favorites') {
					const updated = event.newValue ? JSON.parse(event.newValue) : [];
					this.favorites = updated;
				}
			});
		}
	}

	addFavorite(path: string): void {
		if (!this.favorites.includes(path)) {
			this.favorites.push(path);
			this.#saveToLocalStorage();
		}
	}

	removeFavorite(path: string): void {
		this.favorites = this.favorites.filter((p) => p !== path);
		this.#saveToLocalStorage();
	}

	setFavorites(newOrder: string[]): void {
		this.favorites = [...newOrder];
		this.#saveToLocalStorage();
	}

	isFavorite(path: string): boolean {
		return this.favorites.includes(path);
	}

	getFavorites(): string[] {
		return this.favorites;
	}

	#saveToLocalStorage(): void {
		if (browser) {
			localStorage.setItem('console-favorites', JSON.stringify(this.favorites));
		}
	}
}

export const favorites = new Favorites();
