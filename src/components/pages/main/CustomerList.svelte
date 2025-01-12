<script lang="ts">
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { OiSearch16 } from 'svelte-icons-pack/oi';
  import { lekhika_typing_tool } from '~/tools/converter';
  import { LuRefreshCw } from 'svelte-icons-pack/lu';
  import { goto } from '$app/navigation';
  import { cl_join } from '~/tools/cl_join';

  let { lipi_lekhika_enabled }: { lipi_lekhika_enabled: boolean } = $props();

  let search_term = $state('');

  const customers_list_q = $derived(client_q.customer.get_customers_list.query({ search_term }));
</script>

<div class="mt-4 space-y-3">
  <div class="space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
    <label class="space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
      <Icon src={OiSearch16} class="text-2xl" />
      <input
        oninput={async (e) => {
          if (lipi_lekhika_enabled)
            // @ts-ignore
            await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
              search_term = val;
            });
          else search_term = (e.target as any).value;
        }}
        bind:value={search_term}
        type="text"
        class="input inline-block w-[70%] rounded-md"
        placeholder="ग्राहक आन्वेषण"
      />
    </label>
    <button
      disabled={$customers_list_q.isFetched && $customers_list_q.isFetching}
      onclick={() => $customers_list_q.refetch()}
      class={cl_join(
        'btn select-none p-0 outline-none',
        $customers_list_q.isFetched && $customers_list_q.isFetching && 'animate-spin'
      )}
    >
      <Icon src={LuRefreshCw} class="text-2xl" />
    </button>
  </div>
  <div class="table-wrap">
    <table class="table cursor-default select-none">
      <thead>
        <tr>
          <th></th>
          <th style="font-weight:700;">ग्राहक नाम</th>
          <th style="font-weight:700;">कुल राशि</th>
          <th style="font-weight:700;">शेष राशि</th>
        </tr>
      </thead>
      <tbody class="hover:[&>tr]:preset-tonal-primary">
        {#if $customers_list_q.isFetching || !$customers_list_q.isSuccess}
          {#each Array(20) as _, i}
            <tr>
              <td style="padding: 0; margin:0;">
                <span class="placeholder inline-block h-4 w-4 animate-pulse rounded-sm"></span>
              </td>
              <td>
                <span class="placeholder inline-block h-6 w-28 animate-pulse rounded-lg"></span>
              </td>
              <td>
                <span class="placeholder inline-block h-4 w-14 animate-pulse rounded-lg"></span>
              </td>
              <td>
                <span class="placeholder inline-block h-4 w-14 animate-pulse rounded-lg"></span>
              </td>
            </tr>
          {/each}
        {:else if $customers_list_q.isSuccess}
          {#each $customers_list_q.data as customer}
            <tr
              ondblclick={() => goto(`/vistrita/${customer.customer_id}.${customer.customer_uuid}`)}
            >
              <td style="padding: 0; margin:0;padding-left: 0.35rem;">
                <span class="text-gray-500 dark:text-zinc-400" style="font-size: 0.6rem;"
                  >{customer.customer_id}</span
                >
              </td>
              <td>{customer.customer_name}</td>
              <td>{customer.total_amount}</td>
              <td>{customer.remaining_amount}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
