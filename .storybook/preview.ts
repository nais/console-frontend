import type { Preview } from '@storybook/svelte';

import '@nais/ds-svelte-community/css';
import '../src/styles/colors.css';

const preview: Preview = {
	parameters: { controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } } }
};

export default preview;
