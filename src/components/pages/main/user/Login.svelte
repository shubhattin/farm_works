<script lang="ts">
  import { client_q } from '~/api/client';
  import Spinner from '~/components/Spinner.svelte';
  import { user_info } from '~/state/user.svelte';
  import { cl_join } from '~/tools/cl_join';
  import { get_id_token_info, storeAuthInfo } from '~/tools/auth_tools';
  import { slide } from 'svelte/transition';

  let id = $state(0); // 1st user(admin)
  let password = $state('');
  let pass_input_element = $state<HTMLInputElement>();
  let user_input_element = $state<HTMLInputElement>();

  let wrong_pass_status = $state(false);

  const pass_verify = client_q.auth.verify_pass.mutation({
    onSuccess(data) {
      if (!data.verified) {
        const err_code = data.err_code;
        wrong_pass_status = false;
        if (err_code === 'user_not_found') {
          id = 0;
          password = '';
          user_input_element && user_input_element.focus();
        } else if (err_code === 'wrong_password') {
          password = '';
          pass_input_element && pass_input_element.focus();
          wrong_pass_status = true;
        }
      } else {
        storeAuthInfo(data);
        $user_info = get_id_token_info().user;
      }
    }
  });

  const users_list = client_q.auth.get_admin_users.query();

  const check_pass_func = async (e: Event) => {
    e.preventDefault();
    if (password === '') return;
    $pass_verify.mutate({ id, password });
  };
</script>

<div class="flex justify-center" in:slide>
  <form onsubmit={check_pass_func} class="mt-2 w-full space-y-2.5 sm:w-4/5 md:w-3/5">
    <select bind:value={id} class="select rounded-md px-2 py-1">
      {#if id === 0}
        <option value={0}>-- उपयोक्ता चुनें --</option>
      {/if}
      {#if $users_list.isSuccess}
        {#each $users_list.data as user}
          <option value={user.id}>{user.name}</option>
        {/each}
      {/if}
    </select>
    <input
      class={cl_join('input rounded-md px-2 py-1', wrong_pass_status && 'preset-tonal-error')}
      type="password"
      bind:this={pass_input_element}
      bind:value={password}
      disabled={id === 0}
      placeholder="गूढपद"
      minlength={6}
      required
    />
    <button type="submit" class="btn gap-1 rounded-lg bg-primary-800 py-1 pl-0 pr-4 font-bold">
      <Spinner show={$pass_verify.isPending} />
      <span class="text-white">भरण करें</span>
    </button>
  </form>
</div>
