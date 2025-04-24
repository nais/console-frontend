import { Theme } from '@nais/ds-svelte-community';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview, SvelteRenderer } from '@storybook/svelte';

import '@nais/ds-svelte-community/css/darkside.css';
import '../src/styles/colors.css';
import './storybook-override.css';

// const ModeDecorator : DecoratorFunction<SvelteRenderer> = ({ children, mode, theme }) => {

//       document.body.style.setProperty("background", "var(--ax-bg-default)");

//   return
// };

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	},
	decorators: [
		withThemeByClassName<SvelteRenderer>({
			themes: {
				light: '',
				dark: 'dark'
			},
			defaultTheme: 'light'
		}),
		(_, { userGlobals }) => {
			document.body.style.setProperty('background', 'var(--ax-bg-default)');
			return {
				Component: Theme,
				props: {
					theme: userGlobals.theme
				}
			};
		}
	]
};

export default preview;
