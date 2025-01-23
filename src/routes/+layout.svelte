<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { user_info } from '~/state/user.svelte';
  import { queryClient } from '~/state/queryClient';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
  import TopAppBar from '~/components/TopAppBar.svelte';
  import type { LayoutData } from './$types';
  import { onMount, type Snippet } from 'svelte';
  import { pwa_state } from '~/state/main.svelte';
  import '@fontsource/roboto/latin.css';
  import '@fontsource-variable/noto-sans-devanagari';
  import '../app.pcss';
  import PartyTown from '~/components/tags/PartyTown.svelte';
  import GA from '~/components/tags/GA.svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  user_info.value = null;
  if (data.user_info) user_info.value = data.user_info;

  onMount(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      pwa_state.event_triggerer = event;
      pwa_state.install_event_fired = true;
    });
  });
</script>

<QueryClientProvider client={queryClient}>
  <ModeWatcher />
  <div class="contaiiner mx-auto mb-1 max-w-screen-lg">
    {#if !import.meta.env.VITE_MAINTAIN_MSG || import.meta.env.VITE_MAINTAIN_MSG === 'false'}
      <TopAppBar />
      <div class="mx-2">
        {@render children()}
      </div>
    {:else}
      <div class="mt-4 text-center text-lg font-semibold">
        {import.meta.env.VITE_MAINTAIN_MSG}
      </div>
    {/if}
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
<PartyTown />
<GA />
