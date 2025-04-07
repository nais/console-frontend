import { browser } from '$app/environment';

type Themes = 'dark' | 'light';

class ThemeSwitch {
	theme: Themes = $state('dark');

	constructor() {
		if (browser) {
			this.theme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
		}
	}

	setTheme(theme: 'dark' | 'light') {
		this.theme = theme;
		if (browser) {
			localStorage.setItem('theme', theme);
		}
	}
}

export const themeSwitch = new ThemeSwitch();
