import { type BetterAuthPlugin } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/plugins';
import { z } from 'zod';
import { redis } from '~/db/redis';
import { auth } from '~/lib/auth';

export const userInfoPlugin = () => {
  return {
    id: 'additional_user_info',
    schema: {
      user: {
        fields: {
          is_approved: {
            type: 'boolean',
            defaultValue: false
          },
          is_maintainer: {
            type: 'boolean',
            defaultValue: false
          },
          super_admin: {
            type: 'boolean',
            defaultValue: false
          }
        }
      }
    },
    endpoints: {
      update_user_info: createAuthEndpoint(
        '/user_info/update_user_info',
        {
          method: 'POST',
          requireHeaders: true,
          body: z.object({
            userId: z.string(),
            is_approved: z.boolean(),
            role: z.enum(['user', 'admin', 'super_admin']),
            super_admin: z.boolean()
          })
        },
        async (ctx) => {
          const session = await auth.api.getSession({
            headers: ctx.headers
          });
          if (!session) return ctx.error('UNAUTHORIZED');
          const { user } = session;
          if (!user.is_approved || !user.is_maintainer) return ctx.error('FORBIDDEN');

          const { role, super_admin, is_approved } = ctx.body;
          const updatedUser = await ctx.context.internalAdapter.updateUser(
            ctx.body.userId,
            {
              is_approved,
              role,
              super_admin
            },
            ctx
          );

          // invalidating cache
          const { sessions } = await auth.api.listUserSessions({
            body: {
              userId: ctx.body.userId
            },
            headers: ctx.headers
          });
          await Promise.allSettled(
            sessions.map(async (session, i) => {
              const data = await redis.get<typeof auth.$Infer.Session>(session.token);
              const ttl = await redis.ttl(session.token);
              await redis.set(
                session.token,
                JSON.stringify({ ...data, user: updatedUser }),
                ttl > 0
                  ? {
                      ex: ttl
                    }
                  : {}
              );
            })
          );

          return ctx.json({
            user: updatedUser
          });
        }
      )
    }
  } satisfies BetterAuthPlugin;
};
