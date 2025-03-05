<script lang="ts">
  import { AppBar, Popover } from '@skeletonlabs/skeleton-svelte';
  import ThemeChanger from './ThemeChanger.svelte';
  import Icon from '~/tools/Icon.svelte';
  import { AiOutlineMenu } from 'svelte-icons-pack/ai';
  import { page } from '$app/stores';
  import { PAGE_TITLES } from '~/state/page_titles';
  import type { Snippet } from 'svelte';
  import { pwa_state } from '~/state/main.svelte';
  import { OiDownload24 } from 'svelte-icons-pack/oi';

  let { start, headline, end }: { start?: Snippet; headline?: Snippet; end?: Snippet } = $props();

  let route_id = $derived($page.route.id as keyof typeof PAGE_TITLES);

  let app_bar_popover_status = $state(false);
</script>

<AppBar>
  {#snippet lead()}
    {@render start?.()}
    {#if headline}
      {@render headline()}
    {:else if route_id in PAGE_TITLES}
      <span class={PAGE_TITLES[route_id as keyof typeof PAGE_TITLES][1]}>
        {PAGE_TITLES[route_id as keyof typeof PAGE_TITLES][0]}
      </span>
    {/if}
  {/snippet}
  {#snippet trail()}
    {@render end?.()}
    <Popover
      bind:open={app_bar_popover_status}
      positioning={{ placement: 'left-start' }}
      arrow={false}
      contentBase="card z-50 space-y-2 rounded-lg p-2 shadow-xl bg-surface-100-900"
      triggerBase="btn m-0 p-0 gap-0 outline-hidden select-none"
    >
      {#snippet trigger()}
        <Icon
          src={AiOutlineMenu}
          class="text-3xl hover:text-gray-500 active:text-blue-600 dark:hover:text-gray-400 dark:active:text-blue-400"
        />
      {/snippet}
      {#snippet content()}
        {#if pwa_state.install_event_fired}
          <button
            class="select-none gap-1 px-2 py-1 text-sm outline-hidden"
            onclick={async () => {
              app_bar_popover_status = false;
              if (pwa_state.install_event_fired && pwa_state.event_triggerer)
                await pwa_state.event_triggerer.prompt();
            }}
          >
            <Icon src={OiDownload24} class="-mt-1 text-base" />
            प्रतिस्थापन
          </button>
        {/if}
        <div class="flex space-x-3 rounded-md px-2 py-1">
          <span class="mt-1 font-semibold">अनुप्रयोग स्वरूप</span>
          <ThemeChanger />
        </div>
      {/snippet}
    </Popover>
  {/snippet}
</AppBar>
