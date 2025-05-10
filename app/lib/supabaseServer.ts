import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/supabase-js';

export async function createServerClient() {
  const cookieStore = await cookies();
  console.log("Server cookies:", (await cookieStore.getAll()).map(c => `${c.name}=${c.value}`));
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string): Promise<string | undefined> {
          const cookie = await cookieStore.get(name);
          const value = cookie?.value;
          console.log(`Getting cookie ${name}:`, value);
          if (name === 'sb-hpnigpphcxzmxtfvrlyz-auth-token' && value) {
            try {
              const parsed = JSON.parse(value);
              console.log(`Parsed token for ${name}:`, parsed);
              // Return access_token if valid, else raw value
              const token = parsed.access_token || value;
              console.log(`Returning token for ${name}:`, token);
              return token;
            } catch (err) {
              console.error(`Error parsing cookie ${name}:`, err);
              return value;
            }
          }
          return value;
        },
        async set(name: string, value: string, options: CookieOptions): Promise<void> {
          console.log(`Setting cookie ${name}:`, value, options);
          await cookieStore.set({ name, value, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', ...options });
        },
        async remove(name: string, options: CookieOptions): Promise<void> {
          console.log(`Removing cookie ${name}:`, options);
          await cookieStore.delete({ name, ...options });
        },
      },
    } as any
  );
}