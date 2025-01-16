<script lang="ts">
  import CustomerInfo from '~/components/pages/vistrita/CustomerInfo.svelte';
  import type { PageData } from './$types';
  import { scale, slide } from 'svelte/transition';
  import { PUBLIC_APP_NAME } from '$env/static/public';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title
    >{data.customer_data.customer_info.customer_name} के देयकों का विस्तृत विवरण | {PUBLIC_APP_NAME ??
      ''}</title
  >
</svelte:head>

<div in:scale out:slide>
  <CustomerInfo customer_id={data.id} customer_uuid={data.uuid} />
</div>
