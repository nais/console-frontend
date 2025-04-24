import { browser } from '$app/environment';

type Themes = 'dark' | 'light';

class ThemeSwitch {
	theme: Themes = $state('light');

	setTheme(theme: 'dark' | 'light') {
		this.theme = theme;
		if (browser) {
			const formData = new FormData();
			formData.append('theme', themeSwitch.theme);
			fetch('/api/theme', {
				method: 'POST',
				body: formData
			});
		}
	}
}

export const themeSwitch = new ThemeSwitch();
