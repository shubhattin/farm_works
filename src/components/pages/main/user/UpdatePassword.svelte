<script lang="ts">
  import { VscSave } from 'svelte-icons-pack/vsc';
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';

  interface Props {
    on_done?: () => void;
  }

  let { on_done = null! }: Props = $props();

  let current_password = $state('');
  let new_password = $state('');

  let pass_wrong_status = $state(false);

  const update_password = client_q.auth.update_password.mutation({
    onSuccess(res) {
      if (!res.success) {
        pass_wrong_status = true;
        current_password = '';
        current_password_input_elmnt && current_password_input_elmnt.focus();
        return;
      }
      pass_wrong_status = false;
      on_done();
    }
  });
  const update_password_func = async (e: Event) => {
    e.preventDefault();
    if (!current_password || !new_password) return;
    $update_password.mutate({
      current_password: current_password,
      new_password: new_password
    });
  };
  let current_password_input_elmnt = $state<HTMLInputElement | null>(null);
</script>

<div class="text-center text-xl font-bold text-orange-600 dark:text-yellow-500">
  गूढपद अद्यतित करें
</div>
<form onsubmit={update_password_func} class="mt-1 space-y-2.5 text-base">
  <label class="block space-y-1">
    <span class="space-x-2 font-semibold">
      <span>वर्तमान गूढपद</span>
      {#if pass_wrong_status}
        <span class="ml-2 text-sm font-bold text-red-600 dark:text-red-500">अनुचित गूढपद</span>
      {/if}
    </span>
    <input
      name="password"
      class={'input rounded-lg'}
      type="password"
      autocapitalize="off"
      minlength={6}
      placeholder="वर्तमान गूढपद"
      bind:value={current_password}
      bind:this={current_password_input_elmnt}
      required
    />
  </label>
  <label class="block space-y-1">
    <span class="font-bold">नव गूढपद</span>
    <input
      name="password"
      class={'input rounded-lg'}
      type="password"
      autocapitalize="off"
      minlength={6}
      placeholder="नव गूढपद"
      bind:value={new_password}
      required
    />
  </label>
  <div>
    <button
      type="submit"
      class="btn gap-1 rounded-lg bg-primary-700 px-2 py-1 font-bold text-white"
      disabled={$update_password.isPending}
    >
      <Icon src={VscSave} class="text-xl" />
      अद्यतन करें
    </button>
  </div>
</form>
