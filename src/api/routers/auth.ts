import { protectedProcedure, publicProcedure, t } from '~/api/trpc_init';
import { z } from 'zod';
import { JWT_SECRET } from '~/tools/jwt.server';
import { jwtVerify, SignJWT } from 'jose';
import { puShTi, gen_salt, hash_256 } from '~/tools/hash_tools';
import { UsersSchemaZod } from '~/db/schema_zod';
import { db } from '~/db/db';
import { users } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { delay } from '~/tools/delay';

export const id_token_schema = UsersSchemaZod.pick({
  id: true,
  name: true,
  user_type: true
});
export const accees_token_schema = id_token_schema.pick({
  id: true,
  user_type: true
});

const ID_TOKREN_EXPIRE = '30d';
const ACCESS_TOKEN_EXPIRE = '4h';

const get_id_and_aceess_token = async (user_info: z.infer<typeof id_token_schema>) => {
  // ID Token will be used for authentication, i.e. to verify the user's identity.
  // in our case will also act as refresh tokens
  const id_token = await new SignJWT({ user: user_info, type: 'login' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ID_TOKREN_EXPIRE)
    .sign(JWT_SECRET);

  // Access Token will be used for authorization, i.e. to access the user's resources.
  const access_token = await new SignJWT({
    user: {
      id: user_info.id,
      user_type: user_info.user_type
    },
    type: 'api'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRE)
    .sign(JWT_SECRET);

  return {
    id_token,
    access_token
  };
};

const verify_pass_route = publicProcedure
  .input(
    z.object({
      id: z.number(),
      password: z.string()
    })
  )
  .output(
    z.union([
      z.object({
        verified: z.literal(false),
        err_code: z.enum(['user_not_found', 'wrong_password'])
      }),
      z.object({
        verified: z.literal(true),
        id_token: z.string(),
        access_token: z.string()
      })
    ])
  )
  .mutation(async ({ input: { password, id } }) => {
    let verified = false;
    await delay(600);

    const user_info = await db.query.users.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id)
    });
    if (!user_info) return { verified, err_code: 'user_not_found' };

    verified = await puShTi(password, user_info.password_hash);
    if (!verified) return { verified, err_code: 'wrong_password' };
    const { id_token, access_token } = await get_id_and_aceess_token({
      name: user_info.name,
      id: user_info.id,
      user_type: user_info.user_type
    });
    return {
      verified,
      id_token,
      access_token
    };
  });

const id_token_payload_schema = z.object({
  user: id_token_schema,
  type: z.literal('login')
});

const renew_access_token = publicProcedure
  .input(
    z.object({
      id_token: z.string()
    })
  )
  .output(
    z.union([
      z.object({
        verified: z.literal(false)
      }),
      z.object({
        verified: z.literal(true),
        access_token: z.string(),
        id_token: z.string()
      })
    ])
  )
  .query(async ({ input: { id_token } }) => {
    async function get_user_from_id_token() {
      let payload: z.infer<typeof id_token_payload_schema>;
      try {
        payload = id_token_payload_schema.parse((await jwtVerify(id_token, JWT_SECRET)).payload);
        return payload;
      } catch {}
      return null;
    }
    const user = await get_user_from_id_token();
    if (!user)
      return {
        verified: false
      };
    return { verified: true, ...(await get_id_and_aceess_token(user.user)) };
  });

const update_password_route = protectedProcedure
  .input(
    z.object({
      current_password: z.string(),
      new_password: z.string()
    })
  )
  .mutation(async ({ input: { current_password, new_password }, ctx: { user } }) => {
    const user_info = (await db.query.users.findFirst({
      columns: {
        password_hash: true
      },
      where: ({ id }, { eq }) => eq(id, user.id)
    }))!;
    await delay(500);
    const verified = await puShTi(current_password, user_info.password_hash);
    if (!verified) return { success: false };
    const slt = gen_salt();
    const hashed_password = (await hash_256(new_password + slt)) + slt;
    await db.update(users).set({ password_hash: hashed_password }).where(eq(users.id, user.id));
    return { success: true };
  });

export const auth_router = t.router({
  verify_pass: verify_pass_route,
  renew_access_token: renew_access_token,
  update_password: update_password_route
});
