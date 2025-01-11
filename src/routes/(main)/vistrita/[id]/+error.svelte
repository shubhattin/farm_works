<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.error?.message}</title>
</svelte:head>
<div class="mx-4 my-4 text-lg font-bold">
  {page.error?.message === 'invalid_id_uuid' ? 'अनुचित/अनुपलब्ध प्रमाण संख्या' : ''}
</div>
