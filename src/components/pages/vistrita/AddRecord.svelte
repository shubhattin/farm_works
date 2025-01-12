<script lang="ts">
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { FaSolidMoneyCheck } from 'svelte-icons-pack/fa';
  import { get_utc_date } from '~/tools/date';
  import { scale } from 'svelte/transition';
  import { TrOutlineArrowBackUp } from 'svelte-icons-pack/tr';
  import { CATEOGORY_LIST, kaTAi_list, kaTAI_dhAn_list, jotAI_list } from './type_names';
  import { AiOutlineClose } from 'svelte-icons-pack/ai';
  import { useQueryClient } from '@tanstack/svelte-query';

  let {
    current_page_open = $bindable(),
    customer_id
  }: { current_page_open: boolean; customer_id: number } = $props();

  const query_client = useQueryClient();

  const todays_date = new Date();
  const current_month = todays_date.getMonth() + 1;
  const current_year = todays_date.getFullYear();

  const get_todays_date = () => {
    const prefix_zeros = (n: number) => `${n < 10 ? '0' : ''}${n}`;
    return `${current_year}-${prefix_zeros(current_month)}-${prefix_zeros(todays_date.getDate())}`;
  };

  let date = $state(get_todays_date());
  const handle_submit = async (e: Event) => {
    e.preventDefault();
    if (category === 'kaTAi' && rate && total && kheta && kaTAi) {
      await $add_record_mut.mutateAsync({
        customer_id,
        type: 'kaTAI',
        date: get_utc_date(date),
        total: total,
        rate: rate,
        data: {
          type: kaTAi,
          kheta,
          dhAna_type: kaTAI_dhAn
        }
      });
    } else if (category === 'jotAI' && rate && total && kheta && jotAI) {
      await $add_record_mut.mutateAsync({
        customer_id,
        type: 'jotAI',
        date: get_utc_date(date),
        total: total,
        rate: rate,
        data: {
          type: jotAI,
          kheta,
          chAsa:
            jotAI === 'cultivator' || jotAI === 'tAva' || jotAI === 'rota_meter'
              ? jotAI_chAsa
              : null
        }
      });
    } else if (category === 'trolley' && rate && total && trolley_number) {
      await $add_record_mut.mutateAsync({
        customer_id,
        type: 'trolley',
        date: get_utc_date(date),
        total: total,
        rate: rate,
        data: {
          number: trolley_number
        }
      });
    }
  };

  const add_record_mut = client_q.records.add_record.mutation({
    onSuccess() {
      query_client.invalidateQueries({
        queryKey: [
          ['customer', 'get_customers_data'],
          { input: { customer_id: customer_id }, type: 'query' }
        ],
        exact: true
      });
      query_client.invalidateQueries({
        queryKey: [['customer', 'get_customers_list']],
        exact: false
      }); // wont refetch untill enabled (used)
      current_page_open = false;
      // we may also invalidate the main list cache
    }
  });

  let category: keyof typeof CATEOGORY_LIST | null = $state(null);

  let kaTAi: keyof typeof kaTAi_list | null = $state(null);

  let kaTAI_dhAn: keyof typeof kaTAI_dhAn_list | null = $state(null);

  let jotAI: keyof typeof jotAI_list | null = $state(null);
  let jotAI_chAsa: number | null = $state(null);
  // ^ chAsa only for 1 ,2  and 3

  let trolley_number: number | null = $state(null);

  let rate: number | null = $state(null);
  let kheta: number | null = $state(null);

  let total: number | null = $derived.by(() => {
    if (!rate) return null;
    if (category === 'kaTAi' && kheta) {
      return rate * kheta;
    } else if (category === 'jotAI' && kheta) {
      if (jotAI_chAsa && (jotAI === 'rota_meter' || jotAI === 'cultivator' || jotAI === 'tAva'))
        return rate * jotAI_chAsa * kheta;
      else return rate * kheta;
    } else if (category === 'trolley' && trolley_number) {
      return rate * trolley_number;
    }
    return null;
  });
</script>

{#if !$add_record_mut.isSuccess}
  <div class="mb-2 flex space-x-4">
    <button
      class="btn rounded-lg bg-error-500 px-1.5 py-1 outline-none"
      onclick={() => (current_page_open = false)}
    >
      <Icon src={AiOutlineClose} class="text-2xl text-white" />
    </button>
  </div>
  <form class="space-y-3" onsubmit={handle_submit}>
    <label class="block">
      <span class="label-text font-bold">दिनांक</span>
      <input type="date" class="input rounded-lg" bind:value={date} required />
    </label>
    <label class="block">
      <span class="label-text font-bold">श्रेणी</span>
      <select class="select rounded-lg" bind:value={category} required>
        <option value={null}>-- श्रेणी चयन करें --</option>
        {#each Object.entries(CATEOGORY_LIST) as [key, val]}
          <option value={key}>{val}</option>
        {/each}
      </select>
    </label>
    {#if category === 'kaTAi'}
      {@render kaTAI_types()}
    {:else if category === 'jotAI'}
      {@render jotAI_types()}
    {:else if category === 'trolley'}
      {@render trolley_types()}
    {/if}
    {#if category === 'jotAI' || category === 'kaTAi'}
      <label class="block">
        <span class="label-text font-bold">खेत (बिस्सा में)</span>
        <input type="number" class="input rounded-lg" bind:value={kheta} required />
      </label>
    {/if}
    {#if category}
      <label class="block">
        <span class="label-text font-bold">दर (₹ में)</span>
        <input type="number" class="input rounded-lg" bind:value={rate} required />
      </label>
      {#if total}
        <div class="text-bold space-x-2">
          <span>
            <Icon src={FaSolidMoneyCheck} class="-mt-1 text-xl" />
            सकल
          </span>
          <span>
            ₹ {total}
          </span>
        </div>
      {/if}
      <button
        type="submit"
        disabled={$add_record_mut.isPending}
        class="btn gap-1 rounded-md bg-primary-500 px-2 py-1 pb-0 font-bold text-white dark:bg-primary-600"
      >
        <Icon src={VscAdd} class="text-xl" />
        जोड़ें
      </button>
    {/if}
  </form>
{:else}
  <div class="space-y-1" transition:scale>
    <div class="font-bold text-success-400">सफलतापूर्वक प्रविष्टित किया गया है 🎉 ।</div>
  </div>
  <button
    onclick={() => {
      current_page_open = false;
    }}
    class="btn -ml-1 select-none gap-1 rounded-md bg-surface-500 px-2 py-1 pb-0 font-bold text-white outline-none"
  >
    <Icon src={TrOutlineArrowBackUp} class="-mt-1 text-xl " />
    मुख्य पृष्ठ
  </button>
{/if}

{#snippet kaTAI_types()}
  <label class="block">
    <span class="label-text font-bold">काटाई का प्रकार चुनें</span>
    <select class="select rounded-lg" bind:value={kaTAi} required>
      <option value={null}>-- प्रकार चयन करें --</option>
      {#each Object.entries(kaTAi_list) as [key, val]}
        <option value={key}>{val}</option>
      {/each}
    </select>
  </label>
  {#if kaTAi === 'dhAn'}
    <label class="block">
      <span class="label-text font-bold">धान की कटाई का प्रकार चुनें</span>
      <select class="select rounded-lg" bind:value={kaTAI_dhAn} required>
        <option value={null}>-- प्रकार चयन करें --</option>
        {#each Object.entries(kaTAI_dhAn_list) as [key, val]}
          <option value={key}>{val}</option>
        {/each}
      </select>
    </label>
  {/if}
{/snippet}
{#snippet jotAI_types()}
  <label class="block">
    <span class="label-text font-bold">जोताई का प्रकार चुनें</span>
    <select class="select rounded-lg" bind:value={jotAI} required>
      <option value={null}>-- प्रकार चयन करें --</option>
      {#each Object.entries(jotAI_list) as [key, val]}
        <option value={key}>{val}</option>
      {/each}
    </select>
  </label>
  {#if jotAI === 'rota_meter' || jotAI === 'cultivator' || jotAI === 'tAva'}
    <label class="block">
      <span class="label-text font-bold">चास की संख्या</span>
      <input type="number" class="input rounded-lg" bind:value={jotAI_chAsa} required />
    </label>
  {/if}
{/snippet}
{#snippet trolley_types()}
  <label class="block">
    <span class="label-text font-bold">ट्रॉली का संख्या</span>
    <input type="number" class="input rounded-lg" bind:value={trolley_number} required />
  </label>
{/snippet}
