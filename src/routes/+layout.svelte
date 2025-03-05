<script lang="ts">
  import '@fontsource/roboto/latin.css';
  import '@fontsource-variable/noto-sans-devanagari';
  import '../app.css';
  import '../app.scss';
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { queryClient } from '~/state/queryClient';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
  import TopAppBar from '~/components/TopAppBar.svelte';
  import { onMount, type Snippet } from 'svelte';
  import { pwa_state } from '~/state/main.svelte';
  import PostHogInit from '~/components/tags/PostHogInit.svelte';
  import CookieCacheRefresh from '~/lib/CookieCacheRefresh.svelte';

  let { children }: { children: Snippet } = $props();

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
  <div class="contaiiner mx-auto mb-1 max-w-(--breakpoint-lg)">
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
  <CookieCacheRefresh />
</QueryClientProvider>
<PostHogInit />
