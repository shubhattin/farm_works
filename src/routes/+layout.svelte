<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { user_info } from '~/state/user.svelte';
  import { queryClient } from '~/state/queryClient';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
  import TopAppBar from '~/components/TopAppBar.svelte';
  import type { LayoutData } from './$types';
  import { type Snippet } from 'svelte';
  import '@fontsource/roboto/latin.css';
  import '../app.pcss';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  $user_info = null;
  if (data.user_info) $user_info = data.user_info;
</script>

<QueryClientProvider client={queryClient}>
  <ModeWatcher />
  <div class="contaiiner mx-auto mb-1 max-w-screen-lg">
    <TopAppBar />
    <div class="mx-2">
      {@render children()}
    </div>
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
