import { mount, tick } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('Missing app target');
mount(App, { target });
await tick();
document.documentElement.dataset.ready = 'true';
