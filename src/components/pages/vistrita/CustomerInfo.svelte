<script lang="ts">
  import { client_q, type client } from '~/api/client';
  import { page } from '$app/state';
  import { TiArrowBackOutline, TiTick } from 'svelte-icons-pack/ti';
  import Icon from '~/tools/Icon.svelte';
  import { user_info } from '~/state/user.svelte';
  import { LuRefreshCw, LuShare2 } from 'svelte-icons-pack/lu';
  import { cl_join } from '~/tools/cl_join';
  import { BsDashCircleDotted, BsPlusLg } from 'svelte-icons-pack/bs';
  import AddRecord from './AddRecord.svelte';
  import { fly, scale, slide } from 'svelte/transition';
  import { CATEOGORY_LIST, kaTAI_dhAn_list, jotAI_list, kaTAi_list } from './type_names';
  import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import BillInfo from './BillInfo.svelte';
  import { PUBLIC_APP_NAME } from '$env/static/public';

  let { customer_id, customer_uuid }: { customer_id: number; customer_uuid: string } = $props();

  type customer_data_type = Awaited<ReturnType<typeof client.customer.get_customers_data.query>>;

  let add_record_opened = $state(false);

  let customer_info_q = client_q.customer.get_customers_data.query(
    { customer_id, customer_uuid },
    {
      initialData: page.data.customer_data as customer_data_type
    }
  );

  let selected_category: keyof typeof CATEOGORY_LIST = $state('kaTAi');
  let selected_bill_id = $state<number | null>(null);
  let selected_bill_id_index = $state(0);

  $effect(() => {
    if (selected_category) selected_bill_id = null;
  });

  const share_info_func = async () => {
    if ($user_info && navigator.share) {
      const customer_data = $customer_info_q.data!.customer_info;
      await navigator.share({
        title: `${customer_data.customer_name} के देयकों का विस्तृत विवरण | ${PUBLIC_APP_NAME ?? ''}`,
        text:
          `कुल देय राशि : ₹ ${customer_data.total_amount}` +
          `\nकुल बकाया राशि : ₹ ${customer_data.remaining_amount}` +
          `\nअपने देयकों एवं भुगतानों का विस्तृत विवरण देखें नीचे दिए गए संचित से` +
          `\n\n${window.location.href}`
      });
    }
  };
</script>

<div class={cl_join('mb-4 space-x-3 sm:space-x-4 md:space-x-6', !$user_info && 'mt-4')}>
  {#if $user_info}
    <!-- Non Admin Users also allowed to view but not to edit -->
    <a
      class="btn gap-1 rounded-lg bg-surface-500 p-1 pr-1.5 font-bold text-white outline-none"
      href="/"
    >
      <Icon src={TiArrowBackOutline} class="text-2xl" /> मुख्य पृष्ठ
    </a>
    {#if !add_record_opened && $user_info.user_type === 'admin'}
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
    {@const customer_info = $customer_info_q.data!.customer_info}
    <div class="space-x-1">
      <span class="text-lg font-bold">{customer_info.customer_name}</span>
      <span class="text-sm text-gray-500 dark:text-zinc-400">#{customer_info.customer_id}</span>
      {#if $user_info}
        <!-- This option available to all registered users -->
        <span>
          <button class="btn m-0 select-none gap-1 p-0 outline-none" onclick={share_info_func}>
            <Icon src={LuShare2} class="ml-4 text-2xl" />
          </button>
        </span>
      {/if}
    </div>
    {#if add_record_opened}
      <div in:slide out:slide>
        <AddRecord bind:current_page_open={add_record_opened} {customer_id} {customer_uuid} />
      </div>
    {:else}
      <div class="space-x-1 font-semibold">
        <span>कुल देय राशि :</span>
        <span>₹ {customer_info.total_amount}</span>
      </div>
      <div class="space-x-1 font-semibold">
        <span>कुल बकाया राशि :</span>
        <span
          class={cl_join(
            'text-rose-600 dark:text-rose-300',
            customer_info.remaining_amount === 0 && 'text-green-500 dark:text-green-400'
          )}>₹ {customer_info.remaining_amount}</span
        >
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
  {:else}
    <Tabs bind:value={selected_category} fluid base="mt-6">
      {#snippet list()}
        {#each Object.entries(CATEOGORY_LIST) as [key, val]}
          <Tabs.Control labelClasses="rounded-md font-semibold" value={key}>{val}</Tabs.Control>
        {/each}
      {/snippet}
      {#snippet content()}
        {@const bills_filtered = bills.filter(
          (bill) =>
            bill[
              {
                kaTAi: 'kaTAI_records',
                jotAI: 'jotAI_records',
                trolley: 'trolley_records'
              }[selected_category] as keyof typeof bill
            ]
        )}
        {#if bills_filtered.length === 0}
          <div class="text-sm text-warning-700 dark:text-warning-400">
            {CATEOGORY_LIST[selected_category]} संबन्धी कोई बिल नही है।
          </div>
        {:else}
          <div class="my-1 text-xs text-slate-400 dark:text-neutral-500">
            बिल का विवरण जानने के लिए उस पर दो बार दबाएं।
          </div>
          <div class="table-wrap">
            <table class="table cursor-default select-none">
              <thead>
                <tr>
                  <th></th>
                  <th class="font-bold">दिनांक</th>
                  <th class="font-bold">दर (₹)</th>
                  {#if selected_category === 'kaTAi'}
                    <th class="font-bold">प्रकार</th>
                    <th class="font-bold">खेत (बिस्सा)</th>
                    <th class="font-bold">धान प्रकार</th>
                  {:else if selected_category === 'jotAI'}
                    <th class="font-bold">प्रकार</th>
                    <th class="font-bold">खेत (बिस्सा)</th>
                    <th class="font-bold">चास</th>
                  {:else if selected_category === 'trolley'}
                    <th class="font-bold">संख्या</th>
                  {/if}
                  <th class="font-bold">कुल राशि (₹)</th>
                  <th class="font-bold">शेष राशि (₹)</th>
                </tr>
              </thead>
              <tbody
                class="[&>tr>td]:text-sm sm:[&>tr>td]:text-base hover:[&>tr]:preset-tonal-primary"
              >
                {#each bills_filtered as bill, bill_i (bill.id)}
                  {#if !selected_bill_id || selected_bill_id === bill.id}
                    <!-- Simplified from a' + ab, using boolean algebra -->
                    <tr
                      ondblclick={() => {
                        selected_bill_id_index = bill_i;
                        selected_bill_id = bill.id;
                      }}
                    >
                      <td style="padding: 0; margin:0;padding-left: 0.35rem;">
                        <span class="text-gray-500 dark:text-zinc-400" style="font-size: 0.6rem;"
                          >{bill.id}</span
                        >
                      </td>
                      <td
                        >{bill.date.toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          timeZone: 'Asia/Kolkata'
                        })}</td
                      >
                      <td>{bill.rate}</td>
                      {#if selected_category === 'kaTAi'}
                        {@const kaTAI_record = bill.kaTAI_records!}
                        <td>{kaTAi_list[kaTAI_record.type]}</td>
                        <td>{kaTAI_record.kheta}</td>
                        <td>
                          {#if kaTAI_record.dhAna_type}
                            {kaTAI_dhAn_list[kaTAI_record.dhAna_type]}
                          {:else}
                            <Icon src={BsDashCircleDotted} />
                          {/if}
                        </td>
                      {:else if selected_category === 'jotAI'}
                        {@const jotAI_record = bill.jotAI_records!}
                        <td>{jotAI_list[jotAI_record.type]}</td>
                        <td>{jotAI_record.kheta}</td>
                        <td>
                          {#if jotAI_record.chAsa}
                            {jotAI_record.chAsa}
                          {:else}
                            <Icon src={BsDashCircleDotted} />
                          {/if}
                        </td>
                      {:else if selected_category === 'trolley'}
                        {@const trolley_record = bill.trolley_records!}
                        <td>{trolley_record.number}</td>
                      {/if}
                      <td>{bill.total}</td>
                      <td>
                        {#if !bill.payment_complete}
                          <span class="text-red-500 dark:text-red-200">{bill.remaining_amount}</span
                          >
                        {:else}
                          <Icon src={TiTick} class="text-xl text-green-500 dark:text-green-400" />
                        {/if}
                      </td>
                    </tr>
                  {/if}
                {/each}
              </tbody>
            </table>
          </div>
          {#if selected_bill_id}
            <div in:fly out:scale class="mt-3">
              <BillInfo
                {customer_id}
                {customer_uuid}
                bill_info={bills_filtered[selected_bill_id_index]}
                bind:bill_id={selected_bill_id}
              />
            </div>
          {/if}
        {/if}
      {/snippet}
    </Tabs>
  {/if}
{/snippet}
