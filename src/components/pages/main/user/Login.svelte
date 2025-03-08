<script lang="ts">
  import { signIn } from '~/lib/auth-client';
  import Icon from '~/tools/Icon.svelte';
  import { GoogleIcon } from '~/components/icons';
</script>

<div class="mt-24 flex items-center justify-center sm:mt-40">
  <button
    onclick={async () => {
      await signIn.social({
        provider: 'google',
        callbackURL: '/'
      });
    }}
    class="btn flex gap-2 rounded-lg preset-outlined-primary-700-300 font-semibold"
    ><Icon src={GoogleIcon} class="inline-block text-[1.25rem]" />गूगल से संप्रवेश करें</button
  >
</div>
