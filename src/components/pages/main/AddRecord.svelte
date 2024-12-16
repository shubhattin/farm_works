<script lang="ts">
  import { Combobox } from '@skeletonlabs/skeleton-svelte';
  import { client_q } from '~/api/client';

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
</script>

<div class="space-y-2">
  <Combobox
    data={comboboxData}
    bind:value={customer_id}
    label="ग्राहक"
    placeholder="ग्राहक का नाम प्रविष्ट करें"
  />
  <label>
    <span class="label-text">दिनांक</span>
    <input type="date" class="input rounded-lg" bind:value={date} />
  </label>
</div>
