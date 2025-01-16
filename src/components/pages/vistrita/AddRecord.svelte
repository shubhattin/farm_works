<script lang="ts">
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { FaSolidMoneyCheck } from 'svelte-icons-pack/fa';
  import { scale, slide } from 'svelte/transition';
  import { TrOutlineArrowBackUp } from 'svelte-icons-pack/tr';
  import { CATEOGORY_LIST, kaTAi_list, kaTAI_dhAn_list, jotAI_list } from './type_names';
  import { AiOutlineClose } from 'svelte-icons-pack/ai';
  import { useQueryClient } from '@tanstack/svelte-query';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';

  let {
    current_page_open = $bindable(),
    customer_id,
    customer_uuid
  }: { current_page_open: boolean; customer_id: number; customer_uuid: string } = $props();

  const query_client = useQueryClient();

  const submit_bill_func = async () => {
    confirm_modal_opened = false;
    if (category === 'kaTAi' && rate && total && kheta && kaTAi) {
      await $add_bill_mut.mutateAsync({
        customer_id,
        type: 'kaTAI',
        total: total,
        rate: rate,
        date,
        data: {
          type: kaTAi,
          kheta,
          dhAna_type: kaTAI_dhAn
        }
      });
    } else if (category === 'jotAI' && rate && total && kheta && jotAI) {
      await $add_bill_mut.mutateAsync({
        customer_id,
        type: 'jotAI',
        total: total,
        rate: rate,
        date,
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
      await $add_bill_mut.mutateAsync({
        customer_id,
        type: 'trolley',
        total: total,
        rate: rate,
        date,
        data: {
          number: trolley_number
        }
      });
    }
  };

  const add_bill_mut = client_q.records.add_bill.mutation({
    onSuccess() {
      query_client.invalidateQueries({
        queryKey: [
          ['customer', 'get_customers_data'],
          { input: { customer_id, customer_uuid }, type: 'query' }
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

  let date = $state(new Date());

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

  let confirm_modal_opened = $state(false);
</script>

{#if !$add_bill_mut.isSuccess}
  <div class="mb-2 flex space-x-4">
    <button
      class="btn rounded-lg bg-error-500 px-1.5 py-1 outline-none"
      onclick={() => (current_page_open = false)}
    >
      <Icon src={AiOutlineClose} class="text-2xl text-white" />
    </button>
  </div>
  <form
    class="space-y-4"
    onsubmit={(e: Event) => {
      e.preventDefault();
      confirm_modal_opened = true;
    }}
  >
    <div class="space-x-5 sm:space-x-8">
      {#each Object.entries(CATEOGORY_LIST) as [key, val]}
        <label class="space-x-2">
          <input
            required
            type="radio"
            class="radio text-lg"
            bind:group={category}
            name="category"
            value={key}
          />
          <span class="text-lg font-bold">{val}</span>
        </label>
      {/each}
    </div>
    {#if category === 'kaTAi'}
      <div class="space-y-4" in:slide out:slide>
        {@render kaTAI_types()}
      </div>
    {:else if category === 'jotAI'}
      <div class="space-y-4" in:slide out:slide>
        {@render jotAI_types()}
      </div>
    {:else if category === 'trolley'}
      <div class="space-y-4" in:slide out:slide>
        {@render trolley_types()}
      </div>
    {/if}
    <div transition:slide class="space-y-4">
      {#if category === 'jotAI' || category === 'kaTAi'}
        <label class="block">
          <span class="label-text font-semibold">खेत (बिस्सा में)</span>
          <input type="number" class="input rounded-lg" bind:value={kheta} required />
        </label>
      {/if}
      {#if category}
        <label class="block">
          <span class="label-text font-semibold">दर (₹)</span>
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
          disabled={$add_bill_mut.isPending}
          class="btn gap-1 rounded-md bg-primary-500 px-2 py-1 pb-0 font-bold text-white dark:bg-primary-600"
        >
          <Icon src={VscAdd} class="text-xl" />
          देयक जोड़ें
        </button>
      {/if}
      {#await import('date-picker-svelte') then Module}
        <Module.DateInput
          bind:value={date}
          required={true}
          placeholder="दिनांक"
          format="dd-MM-yyyy HH:mm"
          timePrecision={'minute'}
        />
      {/await}
    </div>
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
  <div class="space-y-0">
    <div class="text-sm font-semibold text-slate-400 dark:text-gray-400">
      धान की कटाई का प्रकार चुनें
    </div>
    <div class="space-x-5">
      {#each Object.entries(kaTAi_list) as [key, val]}
        <label class="flex-inline items-center space-x-2">
          <input
            required
            type="radio"
            class="radio text-base"
            bind:group={kaTAi}
            name="kaTAi"
            value={key}
          />
          <span class="text-base font-bold">{val}</span>
        </label>
      {/each}
    </div>
  </div>
  {#if kaTAi === 'dhAn'}
    <div in:slide out:slide class="space-y-0">
      <span class="text-sm font-semibold text-zinc-400 dark:text-gray-400"
        >धान की कटाई का प्रकार चुनें</span
      >
      <div class="space-x-4">
        {#each Object.entries(kaTAI_dhAn_list) as [key, val]}
          <label class="flex-inline items-center space-x-1">
            <input
              required
              type="radio"
              class="radio text-base"
              bind:group={kaTAI_dhAn}
              name="kaTAI_dhAn"
              value={key}
            />
            <span class="text-base font-bold">{val}</span>
          </label>
        {/each}
      </div>
    </div>
  {/if}
{/snippet}
{#snippet jotAI_types()}
  <label class="block">
    <span class="label-text font-semibold">जोताई का प्रकार चुनें</span>
    <select class="select rounded-lg" bind:value={jotAI} required>
      <option value={null}>-- प्रकार चयन करें --</option>
      {#each Object.entries(jotAI_list) as [key, val]}
        <option value={key}>{val}</option>
      {/each}
    </select>
  </label>
  {#if jotAI === 'rota_meter' || jotAI === 'cultivator' || jotAI === 'tAva'}
    <label class="block">
      <span class="label-text font-semibold">चास की संख्या</span>
      <input type="number" class="input rounded-lg" bind:value={jotAI_chAsa} required />
    </label>
  {/if}
{/snippet}
{#snippet trolley_types()}
  <label class="block">
    <span class="label-text font-semibold">ट्रॉली का संख्या</span>
    <input type="number" class="input rounded-lg" bind:value={trolley_number} required />
  </label>
{/snippet}

<ConfirmModal
  bind:popup_state={confirm_modal_opened}
  confirm_func={submit_bill_func}
  description="क्या आप निश्चि हैं कि इस देयक को जोड़ना चाहते हैं ?"
/>
