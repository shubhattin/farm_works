<script lang="ts">
  import { client_q, client } from '~/api/client';
  import { page } from '$app/state';
  import { TiArrowBackOutline } from 'svelte-icons-pack/ti';
  import Icon from '~/tools/Icon.svelte';
  import { user_info } from '~/state/user.svelte';
  import { LuRefreshCw } from 'svelte-icons-pack/lu';
  import { cl_join } from '~/tools/cl_join';
  import { BsPlusLg } from 'svelte-icons-pack/bs';
  import AddRecord from './AddRecord.svelte';
  import { slide } from 'svelte/transition';

  let { customer_id }: { customer_id: number } = $props();

  type customer_data_type = Awaited<ReturnType<typeof client.customer.get_customers_data.query>>;

  let add_record_opened = $state(false);

  let customer_info_q = client_q.customer.get_customers_data.query(
    { customer_id },
    {
      initialData: page.data.customer_data as customer_data_type
    }
  );
</script>

<div class={cl_join('mb-4 space-x-6', !$user_info && 'mt-4')}>
  {#if $user_info}
    <a
      class="btn gap-1 rounded-lg bg-surface-500 p-1 pr-1.5 font-bold text-white outline-none"
      href="/"
    >
      <Icon src={TiArrowBackOutline} class="text-2xl" /> मुख्य पृष्ठ
    </a>
    {#if !add_record_opened}
      <button
        onclick={() => (add_record_opened = true)}
        class="btn gap-1 rounded-md bg-primary-600 p-1 pr-1.5 font-bold text-white dark:bg-primary-600"
      >
        <Icon src={BsPlusLg} class="text-2xl" />
        नया बिल जोड़ें
      </button>
    {/if}
  {/if}
  {#if !add_record_opened}
    <button
      disabled={$customer_info_q.isFetching}
      onclick={() => $customer_info_q.refetch()}
      class={cl_join(
        'btn select-none p-0 outline-none',
        $customer_info_q.isFetching && 'animate-spin'
      )}
    >
      <Icon src={LuRefreshCw} class="text-2xl" />
    </button>
  {/if}
</div>

<div class="mt-3 space-y-2">
  {#if $customer_info_q.isFetching}
    <div class="placeholder h-8 w-48 animate-pulse rounded-md"></div>
    <div class="placeholder h-6 w-32 animate-pulse rounded-md"></div>
    <div class="placeholder h-6 w-36 animate-pulse rounded-md"></div>
    <div class="placeholder h-96 w-full rounded-lg"></div>
  {:else if !$customer_info_q.isFetching && $customer_info_q.isSuccess}
    {@const user_info = $customer_info_q.data!.user_info}
    <div class="space-x-1">
      <span class="text-lg font-bold">{user_info.customer_name}</span>
      <span class="text-sm text-gray-500 dark:text-zinc-400">#{user_info.customer_id}</span>
    </div>
    {#if add_record_opened}
      <div in:slide out:slide>
        <AddRecord bind:current_page_open={add_record_opened} {customer_id} />
      </div>
    {:else}
      <div class="space-x-1">
        <span>कुल देय राशि :</span>
        <span>₹ {user_info.total_amount}</span>
      </div>
      <div class="space-x-1">
        <span>कुल बकाया राशि :</span>
        <span>₹ {user_info.remaining_amount}</span>
      </div>
      <div>
        {@render render_bills()}
      </div>
    {/if}
  {/if}
</div>

{#snippet render_bills()}
  {@const bills = $customer_info_q.data!.bills}
  {#if bills.length === 0}
    <div class="mt-6 text-sm text-warning-700-300">वर्तमान मे उपभोक्ता का कोई बिल नही है ।</div>
  {/if}
{/snippet}
