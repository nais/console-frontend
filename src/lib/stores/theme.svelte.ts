import { browser } from '$app/env';

type Themes = 'dark' | 'light';

class ThemeSwitch {
	theme: Themes = $state('light');

	async setTheme(theme: 'dark' | 'light') {
		const previous = this.theme;
		this.theme = theme;
		if (browser) {
			const formData = new FormData();
			formData.append('theme', theme);
			try {
				const response = await fetch('/api/theme', {
					method: 'POST',
					body: formData
				});
				if (!response.ok) {
					throw new Error(`Saving color theme failed (${response.status})`);
				}
			} catch (error) {
				this.theme = previous;
				throw error;
			}
		}
	}
}

export const themeSwitch = new ThemeSwitch();
