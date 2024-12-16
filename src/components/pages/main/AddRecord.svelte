<script lang="ts">
  import { Combobox } from '@skeletonlabs/skeleton-svelte';
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { FaSolidMoneyCheck } from 'svelte-icons-pack/fa';

  let customers_list = client_q.customer.get_customers_list.query();

  let comboboxData: {
    label: string;
    value: string;
  }[] = $derived(
    !$customers_list.isFetching && $customers_list.isSuccess
      ? $customers_list.data.map(({ id, name }) => ({
          label: `${name} (${id})`,
          value: id.toString()
        }))
      : []
  );

  const todays_date = new Date();
  const current_month = todays_date.getMonth() + 1;
  const current_year = todays_date.getFullYear();

  const get_todays_date = () => {
    const prefix_zeros = (n: number) => `${n < 10 ? '0' : ''}${n}`;
    return `${current_year}-${prefix_zeros(current_month)}-${prefix_zeros(todays_date.getDate())}`;
  };

  let customer_id = $state(['']);
  let date = $state(get_todays_date());
  const handle_submit = async (e: Event) => {
    e.preventDefault();
  };

  const CATEOGORY_LIST = {
    kaTAi: 'काटाई',
    jotAI: 'जोताई',
    trolley: 'ट्रॉली'
  };
  let category: keyof typeof CATEOGORY_LIST | null = $state(null);

  const kaTAi_list = {
    dhAn: 'धान',
    gehUM: 'गेहूं'
  };
  let kaTAi: keyof typeof kaTAi_list | null = $state(null);
  const kaTAI_dhAn_list = {
    sAdA: 'सादा',
    '4x4': '4x4 (गीला)',
    girA: 'गिरा'
  };
  let kaTAI_dhAn: keyof typeof kaTAI_dhAn_list | null = $state(null);

  const jotAI_list = {
    rota_meter: 'रोटा मीटर',
    cultivator: 'कल्टिवेटर',
    tAva: 'तावा',
    meDza: 'मेड़',
    lohaDzI: 'लोहड़ी',
    super_seeder: 'सुपर सीडर'
  };
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

<form class="space-y-3" onsubmit={handle_submit}>
  <Combobox
    data={comboboxData}
    bind:value={customer_id}
    label="ग्राहक"
    placeholder="ग्राहक का नाम प्रविष्ट करें"
    base="block"
  />
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
      class="btn gap-1 rounded-md bg-primary-500 px-2 py-1 pb-0 font-bold text-white dark:bg-primary-600"
    >
      <Icon src={VscAdd} class="text-xl" />
      जोड़ें
    </button>
  {/if}
</form>

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
