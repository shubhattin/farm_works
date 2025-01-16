import { writable } from 'svelte/store';
import { persistedStore } from '~/tools/persisted_store';

/**
 * This should not be true if PWA is not installable or is already installed
 */
export let pwa_install_event_fired = writable(false);
export let pwa_event_triggerer = writable<any | null>(null);

export let typing_tool_enabled = persistedStore('typing_tool_enabled', true);
