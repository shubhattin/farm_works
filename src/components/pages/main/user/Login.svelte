<script lang="ts">
  import { client_q } from '~/api/client';
  import Spinner from '~/components/Spinner.svelte';
  import { user_info } from '~/state/user.svelte';
  import { cl_join } from '~/tools/cl_join';
  import { get_id_token_info, storeAuthInfo } from '~/tools/auth_tools';
  import { slide } from 'svelte/transition';

  let user_id_or_phone_number = $state('');
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
          user_id_or_phone_number = '';
          password = '';
          user_input_element && user_input_element.focus();
        } else if (err_code === 'wrong_password') {
          password = '';
          pass_input_element && pass_input_element.focus();
          wrong_pass_status = true;
        }
      } else {
        console.log(data);
        storeAuthInfo(data);
        user_info.value = get_id_token_info().user;
      }
    }
  });

  const check_pass_func = async (e: Event) => {
    e.preventDefault();
    if (password === '') return;
    $pass_verify.mutate({ user_id_or_phone_number, password });
  };
</script>

<div class="flex justify-center" in:slide>
  <form onsubmit={check_pass_func} class="mt-2 w-full space-y-2.5 sm:w-4/5 md:w-3/5">
    <label>
      <span class="label-text">उपयोक्ता ID या फ़ोन नंबर</span>
      <input
        autocapitalize="off"
        type="text"
        class="input rounded-md px-2 py-1"
        bind:this={user_input_element}
        bind:value={user_id_or_phone_number}
        name="user_id_or_phone_number"
        placeholder="उपयोक्ता ID"
      />
    </label>
    <input
      class={cl_join('input rounded-md px-2 py-1', wrong_pass_status && 'preset-tonal-error')}
      type="password"
      autocapitalize="off"
      bind:this={pass_input_element}
      bind:value={password}
      disabled={user_id_or_phone_number.length === 0}
      placeholder="गूढपद"
      minlength={6}
      required
    />
    <button type="submit" class="btn gap-1 rounded-lg bg-primary-800 py-1 pl-0 pr-4 font-bold">
      <Spinner show={$pass_verify.isPending} />
      <span class="text-white">संप्रवेश करें</span>
    </button>
  </form>
</div>
