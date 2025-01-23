import { ID_TOKEN_INFO_SCHEMA } from '~/tools/auth_tools';
import { z } from 'zod';

export let user_info = $state<{ value: z.infer<typeof ID_TOKEN_INFO_SCHEMA> | null }>({
  value: null
});
