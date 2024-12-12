import { writable } from 'svelte/store';
import { ID_TOKEN_INFO_SCHEMA } from '~/tools/auth_tools';
import { z } from 'zod';

export let user_info = writable<z.infer<typeof ID_TOKEN_INFO_SCHEMA> | null>(null);
