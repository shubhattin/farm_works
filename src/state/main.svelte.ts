import { persistedStore } from '~/tools/persisted_store';

/**
 * This should not be true if PWA is not installable or is already installed
 */
export let pwa_state = $state<{
  install_event_fired: boolean;
  event_triggerer: any;
}>({
  install_event_fired: false,
  event_triggerer: null
});

export let typing_tool_enabled = persistedStore('typing_tool_enabled', true);
