import { writable } from 'svelte/store';

/**
 * This should not be true if PWA is not installable or is already installed
 */
export let pwa_install_event_fired = writable(false);
export let pwa_event_triggerer = writable<any | null>(null);

export let typing_tool_enabled = writable(true);
